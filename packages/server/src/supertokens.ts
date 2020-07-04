import crypto from "crypto"
import invariant from "tiny-invariant"
import hasha, {HashaInput} from "hasha"
import cookie from "cookie"
import {
  BlitzApiRequest,
  BlitzApiResponse,
  Middleware,
  AuthenticationError,
  CSRFTokenMismatchError,
  SessionConfig,
  SessionModel,
  PublicData,
  PrivateData,
  SessionContext,
  TOKEN_SEPARATOR,
  HANDLE_SEPARATOR,
  SESSION_TYPE_OPAQUE_TOKEN_SIMPLE,
  SESSION_TOKEN_VERSION_0,
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
  apiDomain: "example.com",
  anonymousRole: "public",
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

  // if (!sessionKernel) {
  //   sessionKernel = await createAnonymousSession(res)
  // }

  return createSessionContext(
    res,
    sessionKernel || {
      handle: (null as unknown) as string,
      publicData: {userId: null, roles: []},
    },
  )
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
    getPrivateData: () => getPrivateData(handle),
    setPrivateData: async (data) => {
      await setPrivateData(handle, data)
      // TODO - if anonymous session, create new session and save to DB
      return
    },
    getPublicData: () => getPublicData(handle),
    setPublicData: async (data) => {
      await setPublicData(handle, data)
      // TODO - need to regenerate accessToken here right?
      return
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
  const sessionToken = req.cookies[COOKIE_SESSION_TOKEN] // for essential method
  const idRefreshToken = req.cookies[COOKIE_REFRESH_TOKEN] // for advanced method

  if (sessionToken === undefined && idRefreshToken === undefined) {
    // No session exists
    return null
  }

  if (sessionToken) {
    const {handle, version, hashedPublicData} = parseSessionToken(sessionToken)

    if (!handle) {
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
      // TODO - shouldn't we just return null?
      // throw new AuthenticationError(`Session handle ${handle} doesn't exist`)

      // TODO for anonymous session, how do we return original non-hashed public data??
      return {
        handle,
        publicData: {userId: null, roles: [config.anonymousRole]},
      }
    }

    const enableCsrfProtection = req.method !== "GET" && req.method !== "OPTIONS"
    const antiCSRFToken = req.headers[HEADER_CSRF] as string
    if (enableCsrfProtection && persistedSession.antiCSRFToken !== antiCSRFToken) {
      throw new CSRFTokenMismatchError()
    }
    if (persistedSession.hashedSessionToken !== hash(sessionToken)) {
      // TODO - shouldn't we just return null?
      // throw new AuthenticationError("Input session ID doesn't exist")
      return null
    }
    if (isPast(persistedSession.expiresAt)) {
      await revokeSession(res, handle)
      // TODO - shouldn't we just return null?
      // throw new AuthenticationError("Input session ID doesn't exist")
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
      // TODO - I don't think publicData will ever change here?? Because it comes straight from DB
      const hasPublicDataChanged = hash(persistedSession.publicData) !== hashedPublicData

      let hasQuarterExpiryTimePassed
      // Check if > 1/4th of the expiry time has passed
      // (since we are doing a rolling expiry window).
      hasQuarterExpiryTimePassed =
        differenceInMinutes(persistedSession.expiresAt, new Date()) <
        0.75 * config.sessionExpiryMinutes

      if (hasPublicDataChanged || hasQuarterExpiryTimePassed) {
        const newExpiresAt = addMinutes(new Date(), config.sessionExpiryMinutes)
        const newSessionToken = createSessionToken(handle, persistedSession.publicData)
        const newPublicDataToken = createPublicDataToken(persistedSession.publicData, newExpiresAt)

        setSessionCookie(res, sessionToken, newExpiresAt)
        res.setHeader(HEADER_PUBLIC_DATA_TOKEN, newPublicDataToken)

        // should not wait for this to happen for performance
        // eslint-disable-next-line
        config.updateSession(handle, {
          expiresAt: newExpiresAt,
          hashedSessionToken: hash(newSessionToken),
        })
      }
    }

    return {
      handle,
      publicData: JSON.parse(persistedSession.publicData),
    }
  } else {
    // TODO: advanced method
    return null
  }
}

// --------------------------------
// Create Session
// --------------------------------
export async function createNewSession(
  res: BlitzApiResponse,
  publicData: PublicData,
  privateData: PrivateData = {},
): Promise<SessionKernel> {
  invariant(publicData.userId !== undefined, "You must provide publicData.userId")
  invariant(publicData.roles, "You must provide publicData.roles")

  if (config.method === "essential") {
    const expiresAt = addMinutes(new Date(), config.sessionExpiryMinutes)
    const handle = generateEssentialSessionHandle()
    const sessionToken = createSessionToken(handle, publicData)
    const publicDataToken = createPublicDataToken(JSON.stringify(publicData), expiresAt)
    const antiCSRFToken = createAntiCSRFToken()

    // Don't save to DB if anonymous user
    if (publicData.userId) {
      await config.createSession({
        expiresAt,
        handle,
        userId: publicData.userId,
        hashedSessionToken: hash(sessionToken),
        antiCSRFToken,
        publicData: JSON.stringify(publicData),
        privateData: JSON.stringify(privateData),
      })
    }

    setSessionCookie(res, sessionToken, expiresAt)
    res.setHeader(HEADER_CSRF, antiCSRFToken)
    res.setHeader(HEADER_PUBLIC_DATA_TOKEN, publicDataToken)

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
  return await createNewSession(res, {userId: null, roles: [config.anonymousRole]})
}

// --------------------------------
// Session/DB utils
// --------------------------------

//@ts-ignore
export function refreshSession(req: BlitzApiRequest, res: BlitzApiResponse) {
  // TODO: advanced method
}

export async function updateSessionExpiryInDb(handle: string, expiresAt: Date) {
  return await config.updateSession(handle, {expiresAt})
}

export async function getAllSessionHandlesForUser(userId: string) {
  return (await config.getSessions(userId)).map((session) => session.handle)
}

export async function revokeSession(res: BlitzApiResponse, handle: string): Promise<SessionModel> {
  const result = await config.deleteSession(handle)
  if (result) {
    res.setHeader(HEADER_SESSION_REVOKED, "true")
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
    throw new AuthenticationError("handle doesn't exist")
  }
  return JSON.parse(session.publicData) as PublicData
}

export async function getPrivateData(handle: string): Promise<PrivateData> {
  const session = await config.getSession(handle)
  if (!session) {
    throw new AuthenticationError("handle doesn't exist")
  }
  return JSON.parse(session.privateData) as PrivateData
}

export async function setPrivateData(handle: string, data: PrivateData) {
  try {
    const privateData = JSON.stringify({
      ...(await getPrivateData(handle)),
      ...data,
    })
    await config.updateSession(handle, {privateData})
  } catch (error) {
    // TODO handle error
    throw error
  }
}

export async function setPublicData(handle: string, data: Omit<PublicData, "userId">) {
  // Don't allow updating userId
  delete data.userId

  try {
    // TODO - how do we handle anonymous session here?
    const publicData = JSON.stringify({
      ...(await getPublicData(handle)),
      ...data,
    })
    await config.updateSession(handle, {publicData})
  } catch (error) {
    // TODO handle error
    throw error
  }
}

// --------------------------------
// Token/handle utils
// --------------------------------
const hash = (input: HashaInput) => hasha(input, {algorithm: "sha256"})

export const generateToken = () => crypto.randomBytes(32).toString("base64")

export const generateEssentialSessionHandle = () => {
  return generateToken() + HANDLE_SEPARATOR + SESSION_TYPE_OPAQUE_TOKEN_SIMPLE
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

export const createPublicDataToken = (publicData: string, expireAt: Date) => {
  return btoa([publicData, expireAt.toISOString()].join(TOKEN_SEPARATOR))
}

export const createAntiCSRFToken = () => generateToken()

export const setSessionCookie = (res: BlitzApiResponse, sessionToken: string, expiresAt: Date) => {
  // TODO - what if another middlware use `Set-Cookie`?
  res.setHeader(
    "Set-Cookie",
    cookie.serialize(COOKIE_SESSION_TOKEN, sessionToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: true,
      expires: expiresAt,
    }),
  )
}
