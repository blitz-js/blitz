import crypto from "crypto"
import invariant from "tiny-invariant"
import hasha, {HashaInput} from "hasha"
import cookie from "cookie"
import jwt from "jsonwebtoken"
import {
  BlitzApiRequest,
  BlitzApiResponse,
  Middleware,
  AuthenticationError,
  AuthorizationError,
  CSRFTokenMismatchError,
  SessionConfig,
  SessionModel,
  PublicData,
  PrivateData,
  SessionContext,
  TOKEN_SEPARATOR,
  HANDLE_SEPARATOR,
  SESSION_TYPE_OPAQUE_TOKEN_SIMPLE,
  SESSION_TYPE_ANONYMOUS_JWT,
  SESSION_TOKEN_VERSION_0,
  COOKIE_ANONYMOUS_SESSION_TOKEN,
  COOKIE_SESSION_TOKEN,
  COOKIE_REFRESH_TOKEN,
  HEADER_CSRF,
  HEADER_PUBLIC_DATA_TOKEN,
  HEADER_SESSION_REVOKED,
} from "@blitzjs/core"
import pkgDir from "pkg-dir"
import {join} from "path"
import {addMinutes, isPast, differenceInMinutes} from "date-fns"
import {btoa, atob} from "b64-lite"

const getDb = () => {
  const projectRoot = pkgDir.sync() || process.cwd()
  const path = join(projectRoot, "_db.js")
  return require(path).default
}

const defaultConfig: SessionConfig = {
  sessionExpiryMinutes: 100,
  method: "essential",
  getSession: (handle) => getDb().session.findOne({where: {handle}}),
  getSessions: (userId) => getDb().session.findMany({where: {userId}}),
  createSession: (session) =>
    getDb().session.create({
      data: {...session, userId: undefined, user: {connect: {id: session.userId}}},
    }),
  updateSession: (handle, session) => getDb().session.update({where: {handle}, data: session}),
  deleteSession: (handle) => getDb().session.delete({where: {handle}}),
}

let config: Required<SessionConfig>

// --------------------------------
// Middleware
// --------------------------------
export const sessionMiddleware = (sessionConfig: Partial<SessionConfig> = {}): Middleware => {
  config = {
    ...defaultConfig,
    ...sessionConfig,
  } as Required<SessionConfig>

  return async (req, res, next) => {
    if (req.method !== "HEAD") {
      res.blitzCtx.session = await createSessionContextFromRequest(req, res)
    }
    return next()
  }
}

type SessionKernel = {
  handle: string
  publicData: PublicData
}

export async function createSessionContextFromRequest(
  req: BlitzApiRequest,
  res: BlitzApiResponse,
): Promise<SessionContext> {
  let sessionKernel = await getSession(req, res)

  if (sessionKernel) {
    console.log("Got existing session", sessionKernel)
  }

  if (!sessionKernel) {
    sessionKernel = await createAnonymousSession(res)
  }

  return createSessionContext(res, sessionKernel)
}

export function createSessionContext(
  res: BlitzApiResponse,
  {handle, publicData}: SessionKernel,
): SessionContext {
  return {
    handle,
    userId: publicData.userId,
    roles: publicData.roles,
    publicData,
    authorize(roleOrRoles) {
      if (!this.isAuthorized(roleOrRoles)) {
        throw new AuthorizationError()
      }
    },
    isAuthorized(roleOrRoles) {
      if (!publicData.userId) throw new AuthenticationError()

      const roles = []
      if (Array.isArray(roleOrRoles)) {
        roles.push(...roleOrRoles)
      } else if (roleOrRoles) {
        roles.push(roleOrRoles)
      }

      let isAuthorized = false
      for (const role of roles) {
        if (publicData.roles.includes(role)) isAuthorized = true
      }
      return isAuthorized
    },
    create: async (publicData, privateData) => {
      return createSessionContext(res, await createNewSession(res, publicData, privateData))
    },
    revoke: async () => {
      return !!(await revokeSession(res, handle))
    },
    revokeAll: async () => {
      if (!publicData.userId)
        throw new Error("session.revokeAll() cannot be used with anonymous sessions")
      return !!(await revokeAllSessionsForUser(res, publicData.userId))
    },
    // TODO for anonymous
    getPrivateData: () => {
      return getPrivateData(handle)
    },
    setPrivateData: (data) => {
      return setPrivateData(handle, data)
    },
    getPublicData: () => getPublicData(handle),
    setPublicData: (data) => {
      return setPublicData(res, handle, data)
    },
    // TODO
    // regenerate: () => {},
  }
}

// --------------------------------
// Get Session
// --------------------------------
export async function getSession(
  req: BlitzApiRequest,
  res: BlitzApiResponse,
): Promise<SessionKernel | null> {
  const anonymousSessionToken = req.cookies[COOKIE_ANONYMOUS_SESSION_TOKEN]
  const sessionToken = req.cookies[COOKIE_SESSION_TOKEN] // for essential method
  const idRefreshToken = req.cookies[COOKIE_REFRESH_TOKEN] // for advanced method
  const enableCsrfProtection = req.method !== "GET" && req.method !== "OPTIONS"
  const antiCSRFToken = req.headers[HEADER_CSRF] as string

  if (sessionToken) {
    const {handle, version, hashedPublicData} = parseSessionToken(sessionToken)

    if (!handle) {
      console.log("No session: no handle")
      return null
    }

    if (version !== SESSION_TOKEN_VERSION_0) {
      console.log(
        new AuthenticationError("Session token version is not " + SESSION_TOKEN_VERSION_0),
      )
      return null
    }

    const persistedSession = await config.getSession(handle)
    if (!persistedSession) {
      console.log("No session: not in DB")
      return null
    }

    if (enableCsrfProtection && persistedSession.antiCSRFToken !== antiCSRFToken) {
      throw new CSRFTokenMismatchError()
    }
    if (persistedSession.hashedSessionToken !== hash(sessionToken)) {
      console.log("No session: sessionToken hash did not match")
      console.log("In db:", persistedSession.hashedSessionToken)
      console.log("In token hashed:", hash(sessionToken))
      console.log("In token:", sessionToken)
      return null
    }
    if (isPast(persistedSession.expiresAt)) {
      await revokeSession(res, handle)
      return null
    }

    /*
     * Session Renewal - Will renew if any of the following is true
     * 1) publicData has changed
     * 2) 1/4 of expiry time has elasped
     *
     *  But only renew with non-GET requests because a GET request could be from a
     *  browser level navigation
     */
    if (req.method !== "GET") {
      // The publicData in the DB could have been updated since this client last made
      // a request. If so, then we generate a new access token
      const hasPublicDataChanged = hash(persistedSession.publicData) !== hashedPublicData

      if (hasPublicDataChanged) {
        console.log("PUBLIC DATA HAS CHANGED")
      }

      let hasQuarterExpiryTimePassed
      // Check if > 1/4th of the expiry time has passed
      // (since we are doing a rolling expiry window).
      hasQuarterExpiryTimePassed =
        differenceInMinutes(persistedSession.expiresAt, new Date()) <
        0.75 * config.sessionExpiryMinutes

      if (hasPublicDataChanged || hasQuarterExpiryTimePassed) {
        await refreshSession(res, handle, persistedSession.publicData)
      }
    }

    return {
      handle,
      publicData: JSON.parse(persistedSession.publicData),
    }
  } else if (idRefreshToken) {
    // TODO: advanced method
    return null
    // Important: check anonymousSessionToken token as the very last thing
  } else if (anonymousSessionToken) {
    const payload = parseAnonymousSessionToken(anonymousSessionToken)

    if (!payload) {
      return null
    }

    if (enableCsrfProtection && payload.antiCSRFToken !== antiCSRFToken) {
      throw new CSRFTokenMismatchError()
    }

    return {
      handle: payload.handle,
      publicData: payload.publicData,
    }
  }

  // No session exists
  return null
}

// --------------------------------
// Create Session
// --------------------------------
export async function createNewSession(
  res: BlitzApiResponse,
  publicData: PublicData,
  privateData: PrivateData = {},
  opts: {anonymous?: boolean} = {},
): Promise<SessionKernel> {
  invariant(publicData.userId !== undefined, "You must provide publicData.userId")
  invariant(publicData.roles, "You must provide publicData.roles")

  const antiCSRFToken = createAntiCSRFToken()

  if (opts.anonymous) {
    const handle = generateAnonymousSessionHandle()
    const anonymousSessionToken = createAnonymousSessionToken(handle, publicData, antiCSRFToken)
    const publicDataToken = createPublicDataToken(JSON.stringify(publicData))

    setAnonymousSessionCookie(res, anonymousSessionToken)
    res.setHeader(HEADER_CSRF, antiCSRFToken)
    res.setHeader(HEADER_PUBLIC_DATA_TOKEN, publicDataToken)
    // Clear the essential session cookie in case it was previously set
    setSessionCookie(res, "", new Date(0))

    return {
      handle,
      publicData,
    }
  } else if (config.method === "essential") {
    invariant(publicData.userId, "You must provide a non-empty userId as publicData.userId")

    const expiresAt = addMinutes(new Date(), config.sessionExpiryMinutes)
    const handle = generateEssentialSessionHandle()
    const sessionToken = createSessionToken(handle, publicData)
    const publicDataToken = createPublicDataToken(JSON.stringify(publicData), expiresAt)

    await config.createSession({
      expiresAt,
      handle,
      userId: publicData.userId,
      hashedSessionToken: hash(sessionToken),
      antiCSRFToken,
      publicData: JSON.stringify(publicData),
      privateData: JSON.stringify(privateData),
    })

    setSessionCookie(res, sessionToken, expiresAt)
    res.setHeader(HEADER_CSRF, antiCSRFToken)
    res.setHeader(HEADER_PUBLIC_DATA_TOKEN, publicDataToken)
    // Clear the anonymous session cookie in case it was previously set
    setAnonymousSessionCookie(res, "", new Date(0))

    return {
      handle,
      publicData,
    }
  } else if (config.method === "advanced") {
    throw new Error("The advanced method is not yet supported")
  } else {
    throw new Error(
      `Session management method ${config.method} is invalid. Supported methods are "essential" and "advanced"`,
    )
  }
}

export async function createAnonymousSession(res: BlitzApiResponse) {
  console.log("Creating anonymous session")
  return await createNewSession(res, {userId: null, roles: []}, undefined, {anonymous: true})
}

// --------------------------------
// Session/DB utils
// --------------------------------

export async function refreshSession(
  res: BlitzApiResponse,
  handle: string,
  publicData: string | PublicData,
) {
  if (config.method === "essential") {
    const expiresAt = addMinutes(new Date(), config.sessionExpiryMinutes)
    const sessionToken = createSessionToken(handle, publicData)
    const publicDataToken = createPublicDataToken(publicData, expiresAt)

    setSessionCookie(res, sessionToken, expiresAt)
    res.setHeader(HEADER_PUBLIC_DATA_TOKEN, publicDataToken)

    const hashedSessionToken = hash(sessionToken)

    await config.updateSession(handle, {
      expiresAt,
      hashedSessionToken,
      publicData: typeof publicData === "string" ? publicData : JSON.stringify(publicData),
    })
  } else if (config.method === "advanced") {
    throw new Error("refreshSession() not implemented for advanced method")
  }
}

export async function getAllSessionHandlesForUser(userId: string) {
  return (await config.getSessions(userId)).map((session) => session.handle)
}

export async function revokeSession(res: BlitzApiResponse, handle: string): Promise<SessionModel> {
  const result = await config.deleteSession(handle)
  if (result) {
    // This is used on the frontend to clear localstorage
    res.setHeader(HEADER_SESSION_REVOKED, "true")

    // Clear all cookies
    setSessionCookie(res, "", new Date(0))
    setAnonymousSessionCookie(res, "", new Date(0))
  }
  return result
}

export function revokeMultipleSessions(res: BlitzApiResponse, sessionHandles: string[]) {
  let revoked: string[] = []
  for (const handle of sessionHandles) {
    if (revokeSession(res, handle)) {
      revoked.push(handle)
    }
  }
  return revoked
}

export async function revokeAllSessionsForUser(res: BlitzApiResponse, userId: string | number) {
  let sessionHandles = (await config.getSessions(userId)).map((session) => session.handle)
  return revokeMultipleSessions(res, sessionHandles)
}

export async function getPublicData(handle: string): Promise<PublicData> {
  const session = await config.getSession(handle)
  if (!session) {
    throw new Error("getPublicData() failed because handle doesn't exist " + handle)
  }
  return JSON.parse(session.publicData) as PublicData
}

export async function getPrivateData(handle: string): Promise<Record<any, any>> {
  const session = await config.getSession(handle)
  if (!session) {
    throw new Error("getPrivateData() failed because handle doesn't exist")
  }
  return JSON.parse(session.privateData) as Record<any, any>
}

export async function setPrivateData(handle: string, data: Record<any, any>) {
  const privateData = JSON.stringify({
    ...(await getPrivateData(handle)),
    ...data,
  })
  await config.updateSession(handle, {privateData})
}

// TODO - how to update public data for all sessions (like if user's roles change)
export async function setPublicData(res: BlitzApiResponse, handle: string, data: Record<any, any>) {
  // Don't allow updating userId
  delete data.userId

  // TODO - how do we handle anonymous session here?
  const publicData = {
    ...(await getPublicData(handle)),
    ...data,
  }

  await refreshSession(res, handle, publicData)
}

// --------------------------------
// Token/handle utils
// --------------------------------
const hash = (input: HashaInput) => hasha(input, {algorithm: "sha256"})

export const generateToken = () => crypto.randomBytes(32).toString("base64")

export const generateEssentialSessionHandle = () => {
  return generateToken() + HANDLE_SEPARATOR + SESSION_TYPE_OPAQUE_TOKEN_SIMPLE
}

export const generateAnonymousSessionHandle = () => {
  return generateToken() + HANDLE_SEPARATOR + SESSION_TYPE_ANONYMOUS_JWT
}

export const createSessionToken = (handle: string, publicData: PublicData | string) => {
  // We store the hashed public data in the opaque token so that when we verify,
  // we can detect changes in it and return a new set of tokens if necessary.

  let publicDataString
  if (typeof publicData === "string") {
    publicDataString = publicData
  } else {
    publicDataString = JSON.stringify(publicData)
  }
  return btoa(
    [handle, generateToken(), hash(publicDataString), SESSION_TOKEN_VERSION_0].join(
      TOKEN_SEPARATOR,
    ),
  )
}
export const parseSessionToken = (token: string) => {
  const [handle, id, hashedPublicData, version] = atob(token).split(TOKEN_SEPARATOR)

  if (!handle || !id || !hashedPublicData || !version) {
    throw new AuthenticationError("Failed to parse session token")
  }

  return {
    handle,
    id,
    hashedPublicData,
    version,
  }
}

export const createPublicDataToken = (publicData: string | PublicData, expireAt?: Date) => {
  const payload = [typeof publicData === "string" ? publicData : JSON.stringify(publicData)]
  if (expireAt) {
    payload.push(expireAt.toISOString())
  }
  return btoa(payload.join(TOKEN_SEPARATOR))
}

export const createAntiCSRFToken = () => generateToken()

export type AnonymousSessionPayload = {
  handle: string
  publicData: PublicData
  antiCSRFToken: string
}

export const createAnonymousSessionToken = (
  handle: string,
  publicData: PublicData,
  antiCSRFToken: string,
) => {
  const payload: AnonymousSessionPayload = {
    handle,
    publicData,
    antiCSRFToken,
  }
  // TODO use secret from ENV for production
  return jwt.sign(payload, "secret", {algorithm: "HS256"})
}

export const parseAnonymousSessionToken = (token: string) => {
  // TODO use secret from ENV for production
  try {
    return jwt.verify(token, "secret", {algorithms: ["HS256"]}) as AnonymousSessionPayload
  } catch (error) {
    return null
  }
}

export const setSessionCookie = (res: BlitzApiResponse, sessionToken: string, expiresAt: Date) => {
  setCookie(
    res,
    cookie.serialize(COOKIE_SESSION_TOKEN, sessionToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: true,
      expires: expiresAt,
    }),
  )
}

export const setAnonymousSessionCookie = (
  res: BlitzApiResponse,
  token: string,
  expiresAt?: Date,
) => {
  setCookie(
    res,
    cookie.serialize(COOKIE_ANONYMOUS_SESSION_TOKEN, token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: true,
      expires: expiresAt,
    }),
  )
}

export const setCookie = (res: BlitzApiResponse, cookie: string) => {
  append(res, "Set-Cookie", cookie)
}

/**
 * Append additional header `field` with value `val`.
 *
 * Example:
 *
 *    append(res, 'Set-Cookie', 'foo=bar; Path=/; HttpOnly');
 *
 * @param {BlitzApiResponse} res
 * @param {string} field
 * @param {string| string[]} val
 */
export function append(res: BlitzApiResponse, field: string, val: string | string[]) {
  let prev: string | string[] | undefined = res.getHeader(field) as string | string[] | undefined
  let value = val

  if (prev !== undefined) {
    // concat the new and prev vals
    value = Array.isArray(prev)
      ? prev.concat(val)
      : Array.isArray(val)
      ? [prev].concat(val)
      : [prev, val]
  }

  value = Array.isArray(value) ? value.map(String) : String(value)

  res.setHeader(field, value)
  return res
}
