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
} from "@blitzjs/core"
import pkgDir from "pkg-dir"
import {join} from "path"
import {addMinutes, isPast, differenceInMinutes} from "date-fns"
import {btoa, atob} from "b64-lite"

export const TOKEN_SEPARATOR = ";"
export const HANDLE_SEPARATOR = ":"
export const SESSION_TYPE_OPAQUE_TOKEN_SIMPLE = "ots"
export const SESSION_TOKEN_VERSION_0 = "v0"

export const COOKIE_SESSION_TOKEN = "sSessionToken"
export const COOKIE_REFRESH_TOKEN = "sIdRefreshToken"

export const HEADER_CSRF = "anti-csrf"
export const HEADER_PUBLIC_DATA_TOKEN = "public-data-token"

export interface PublicData extends Record<any, unknown> {
  userId: string | number | null
  roles: string[]
}
export type PrivateData = Record<any, unknown>

export interface SessionModel extends Record<any, any> {
  expiresAt: Date
  handle: string
  userId: string | number
  hashedSessionToken: string
  antiCSRFToken: string
  publicData: string
  privateData: string
}

export type SessionConfig = {
  sessionExpiryMinutes?: number
  method?: "essential" | "advanced"
  apiDomain?: string
  anonymousRole?: string
  getSession: (handle: string) => Promise<SessionModel>
  getSessions: (userId: string | number) => Promise<SessionModel[]>
  createSession: (session: SessionModel) => Promise<SessionModel>
  updateSession: (handle: string, session: Partial<SessionModel>) => Promise<SessionModel>
  deleteSession: (handle: string) => Promise<SessionModel>
}

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

export type SessionContext = {
  /**
   * null if anonymous
   */
  userId: string | number | null
  roles: string[]
  handle: string | null
  publicData: PublicData
  create: (publicData: PublicData, privateData?: PrivateData) => Promise<SessionContext>
  revoke: () => Promise<boolean>
  getPrivateData: () => Promise<PrivateData>
  setPrivateData: (data: PrivateData) => Promise<void>
  getPublicData: () => Promise<PublicData>
  setPublicData: (data: PublicData) => Promise<void>
  // TODO
  // regenerate: (arg: {publicData: PublicData}) => Promise<SessionContext>
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
    create: async (publicData, privateData) => {
      return createSessionContext(res, await createNewSession(res, publicData, privateData))
    },
    revoke: async () => {
      return !!(await revokeSession(handle))
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
      await revokeSession(handle)
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

export async function revokeSession(handle: string): Promise<SessionModel> {
  return await config.deleteSession(handle)
}

export function revokeMultipleSessions(sessionHandles: string[]) {
  let revoked: string[] = []
  for (const handle of sessionHandles) {
    if (revokeSession(handle)) {
      revoked.push(handle)
    }
  }
  return revoked
}

export async function revokeAllSessionsForUser(userId: string) {
  let sessionHandles = (await config.getSessions(userId)).map((session) => session.handle)
  return revokeMultipleSessions(sessionHandles)
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

export const parsePublicDataToken = (token: string) => {
  const [publicDataStr, expireAt] = atob(token).split(TOKEN_SEPARATOR)
  return {
    publicData: JSON.parse(publicDataStr),
    expireAt: new Date(expireAt),
  }
}

export const createAntiCSRFToken = () => generateToken()

export const setSessionCookie = (res: BlitzApiResponse, sessionToken: string, expiresAt: Date) => {
  // TODO - what if another middlware use `Set-Cookie`?
  res.setHeader(
    "Set-Cookie",
    cookie.serialize(COOKIE_SESSION_TOKEN, sessionToken, {
      //TODO - domain - can we omit?
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: true,
      expires: expiresAt,
    }),
  )
}
