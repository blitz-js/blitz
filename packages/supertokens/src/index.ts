import invariant from "tiny-invariant"
import {v4 as uuidv4} from "uuid"
import hasha, {HashaInput} from "hasha"
import cookie from "cookie"
import {BlitzApiRequest, BlitzApiResponse, Middleware} from "@blitzjs/core"
import {addMinutes, isPast, differenceInMinutes} from "date-fns"

const TOKEN_SEPARATOR = ";"
const HANDLE_SEPARATOR = ":"
const SESSION_TYPE_OPAQUE_TOKEN_SIMPLE = "ots"
const SESSION_TOKEN_VERSION_0 = "v0"

const COOKIE_SESSION_TOKEN = "sSessionToken"
const COOKIE_REFRESH_TOKEN = "sIdRefreshToken"

const HEADER_CSRF = "anti-csrf"
const HEADER_PUBLIC_DATA_TOKEN = "public-data-token"

export interface PublicData extends Record<any, unknown> {
  userId: string | number | null
  role: string
}
export type PrivateData = Record<any, unknown>

type SessionModel = {
  createdAt: Date
  expiresAt: Date
  handle: string
  userId: string | number
  hashedSessionToken: string
  antiCSRFToken: string
  publicData: string
  privateData: string
}

const defaultConfig = {
  sessionExpiryMinutes: 100,
  method: "essential",
  apiDomain: "example.com",
  async getSession(handle: string): Promise<SessionModel> {
    await true
    return {} as SessionModel
  },
  async getSessions(userId: string | number): Promise<SessionModel[]> {
    await true
    return [] as SessionModel[]
  },
  async createSession(session: SessionModel): Promise<SessionModel> {
    await true
    return {} as SessionModel
  },
  async updateSession(handle: string, session: Partial<SessionModel>): Promise<SessionModel> {
    await true
    return {} as SessionModel
  },
  async deleteSession(handle: string): Promise<boolean> {
    await true
    return true
  },
}

// --------------------------------
// Errors
// --------------------------------

class AuthenticationError extends Error {
  // TODO implement constructor and custom name
}
class AntiCSRFTokenMismatchException extends Error {
  // TODO implement constructor and custom name
}

export type SessionContext = {
  /**
   * null if anonymous
   */
  userId: string | null
  role: string
  handle: string
  create: (arg: {publicData: PublicData; privateData?: PrivateData}) => Promise<SessionContext>
  revoke: () => Promise<boolean>
  getPrivateData: () => Promise<PrivateData>
  setPrivateData: (data: PrivateData) => Promise<void>
  getPublicData: () => Promise<PublicData>
  // TODO
  // regenerate: (arg: {publicData: PublicData}) => Promise<SessionContext>
}

// --------------------------------
// Middleware
// --------------------------------
export const sessionMiddleware: Middleware = async (req, res, next) => {
  try {
    res.blitzCtx.session = await createSessionContextFromRequest(req, res)
    return next()
  } catch (err) {
    // if (Session.Error.isUnauthorized(err)) {
    //   if (Session.Error.isAntiCSRFTokenFailed(err)) {
    //     throw err
    //   }
    // } else {
    //   throw err
    // }
  }
}

export async function createSessionContextFromRequest(
  req: BlitzApiRequest,
  res: BlitzApiResponse,
): Promise<SessionContext> {
  let session = await getSession(req, res)

  if (!session) {
    session = await createAnonymousSession(res)
  }

  return createSessionContext(res, session)
}

export function createSessionContext(
  res: BlitzApiResponse,
  {
    handle,
  }: {
    handle: string
    publicData: PublicData
  },
): SessionContext {
  return {
    //TODO - where does userId come from?
    userId: null,
    //TODO - where does role come from?
    role: "public",
    handle,
    create: async ({publicData, privateData}) => {
      return createSessionContext(res, await createNewSession(res, publicData, privateData))
    },
    revoke: () => revokeSession(handle),
    getPrivateData: () => getPrivateData(handle),
    setPrivateData: (data) => setPrivateData(handle, data),
    getPublicData: () => getPublicData(handle),
    // TODO
    // regenerate: () => {},
  }
}

// --------------------------------
// General utils
// --------------------------------
const base64 = (input: HashaInput) => hasha(input, {encoding: "base64"})
const hash = (input: HashaInput) => hasha(input, {algorithm: "sha256"})

// --------------------------------
// Session utils
// --------------------------------
export const generateEssentialSessionHandle = () => {
  return uuidv4() + HANDLE_SEPARATOR + SESSION_TYPE_OPAQUE_TOKEN_SIMPLE
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
  return base64(
    [handle, uuidv4(), hash(publicDataString), SESSION_TOKEN_VERSION_0].join(TOKEN_SEPARATOR),
  )
}
export const parseSessionToken = (token: string) => {
  const [handle, id, hashedPublicData, version] = token.split(TOKEN_SEPARATOR)
  return {
    handle,
    id,
    hashedPublicData,
    version,
  }
}

export const createPublicDataToken = (publicData: string, expireAt: Date) => {
  return base64([publicData, expireAt].join(TOKEN_SEPARATOR))
}

export const createAntiCSRFToken = () => uuidv4()

export const setSessionCookie = (res: BlitzApiResponse, sessionToken: string, expiresAt: Date) => {
  // TODO - what if another middlware use `Set-Cookie`?
  res.setHeader(
    "Set-Cookie",
    cookie.serialize(COOKIE_SESSION_TOKEN, sessionToken, {
      //domain - can we omit?
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: true,
      expires: expiresAt,
    }),
  )
}

export async function createAnonymousSession(res: BlitzApiResponse) {
  return await createNewSession(res, {userId: null, role: "public"})
}

// --------------------------------
// createNewSession()
// --------------------------------
export async function createNewSession(
  res: BlitzApiResponse,
  publicData: PublicData,
  privateData: PrivateData = {},
) {
  const config = defaultConfig

  invariant(publicData.userId, "You must publicData.userId")
  invariant(publicData.role, "You must publicData.role")

  // Ensure userId is a string within the session library
  const userId = publicData.userId.toString()

  if (config.method === "essential") {
    // TODO handle anonymous
    const {
      handle,
      sessionToken,
      antiCSRFToken,
      publicDataToken,
      expiresAt,
    } = await createNewSessionHelper(userId, publicData, privateData)

    setSessionCookie(res, sessionToken, expiresAt)
    res.setHeader(HEADER_CSRF, antiCSRFToken)
    res.setHeader(HEADER_PUBLIC_DATA_TOKEN, publicDataToken)

    return {
      handle,
      publicData,
    }
  } else if (config.method === "essential") {
    throw new Error("The advanced method is not yet supported")
  } else {
    throw new Error(
      `Session management method ${config.method} is invalid. Supported methods are "essential" and "advanced"`,
    )
  }
}

export async function createNewSessionHelper(
  userId: string,
  publicData: PublicData,
  privateData: PrivateData,
) {
  const config = defaultConfig

  const createdAt = new Date()
  const expiresAt = addMinutes(createdAt, config.sessionExpiryMinutes)
  const handle = generateEssentialSessionHandle()
  const sessionToken = createSessionToken(handle, publicData)
  const publicDataToken = createPublicDataToken(JSON.stringify(publicData), expiresAt)
  const antiCSRFToken = createAntiCSRFToken()

  try {
    await config.createSession({
      handle,
      userId,
      hashedSessionToken: hash(sessionToken),
      antiCSRFToken,
      publicData: JSON.stringify(publicData),
      privateData: JSON.stringify(privateData),
      expiresAt,
      createdAt,
    })
  } catch (error) {
    // TODO handler error
  }

  return {
    handle,
    sessionToken,
    antiCSRFToken,
    publicDataToken,
    expiresAt,
  }
}

export async function getSession(req: BlitzApiRequest, res: BlitzApiResponse) {
  const enableCsrfProtection = req.method !== "GET" && req.method !== "OPTIONS"
  const sessionToken = req.cookies[COOKIE_SESSION_TOKEN] // for essential method
  const idRefreshToken = req.cookies[COOKIE_REFRESH_TOKEN] // for advanced method

  if (sessionToken === undefined && idRefreshToken === undefined) {
    // No session exists
    return null
  }

  if (sessionToken) {
    let antiCSRFToken = req.headers[HEADER_CSRF] as string
    let {
      handle,
      publicData,
      newSessionToken,
      newPublicDataToken,
      newExpiresAt,
    } = await getSessionHelper(
      sessionToken,
      antiCSRFToken,
      enableCsrfProtection,
      req.method as string,
    )

    if (newSessionToken && newExpiresAt) {
      setSessionCookie(res, sessionToken, newExpiresAt)
    }
    if (newPublicDataToken) {
      res.setHeader(HEADER_PUBLIC_DATA_TOKEN, newPublicDataToken)
    }

    return {
      handle,
      publicData,
    }
  } else {
    // TODO: advanced method
    return null
  }
}

export async function getSessionHelper(
  sessionToken: string,
  inputAntiCSRFToken: string | undefined,
  enableCsrfProtection: boolean,
  httpMethod: string,
) {
  const config = defaultConfig

  const {handle, version, hashedPublicData} = parseSessionToken(sessionToken)

  if (version !== SESSION_TOKEN_VERSION_0) {
    throw new AuthenticationError("Session token is not " + SESSION_TOKEN_VERSION_0)
  }

  let session = await config.getSession(handle)

  if (!session) {
    throw new AuthenticationError("Input session ID doesn't exist")
  }
  if (enableCsrfProtection && session.antiCSRFToken !== inputAntiCSRFToken) {
    throw new AntiCSRFTokenMismatchException()
  }
  if (hash(sessionToken) !== session.hashedSessionToken) {
    throw new AuthenticationError("Input session ID doesn't exist")
  }
  if (isPast(session.expiresAt)) {
    await revokeSession(handle)
    throw new AuthenticationError("Input session ID doesn't exist")
  }

  let newSessionToken
  let newPublicDataToken
  let newExpiresAt

  let quarterExpiryTimePassed
  // Only renew with non-GET requests
  // We can't reliably update the frontend expiry information in GET requests since they could
  // be from a browser level navigation (for example: user opening the site after a long time).
  if (httpMethod !== "GET") {
    // Check if > 1/4th of the expiry time has passed
    // (since we are doing a rolling expiry window).
    quarterExpiryTimePassed =
      differenceInMinutes(session.expiresAt, new Date()) < 0.75 * config.sessionExpiryMinutes
  }

  const publicDataChanged = hash(session.publicData) !== hashedPublicData

  if (publicDataChanged || quarterExpiryTimePassed) {
    newExpiresAt = addMinutes(new Date(), config.sessionExpiryMinutes)
    newPublicDataToken = createPublicDataToken(session.publicData, newExpiresAt)
    newSessionToken = createSessionToken(handle, session.publicData)

    // should not wait for this to happen
    // eslint-disable-next-line
    updateSessionExpiryInDb(handle, newExpiresAt)
  }
  return {
    handle,
    publicData: JSON.parse(session.publicData),
    newSessionToken,
    newPublicDataToken,
    newExpiresAt,
  }
}

export function refreshSession(req: BlitzApiRequest, res: BlitzApiResponse) {
  // TODO: advanced method
}

export async function updateSessionExpiryInDb(handle: string, expiresAt: Date) {
  const config = defaultConfig
  return await config.updateSession(handle, {expiresAt})
}

export async function getAllSessionHandlesForUser(userId: string) {
  const config = defaultConfig
  return (await config.getSessions(userId)).map((session) => session.handle)
}

export async function revokeSession(handle: string): Promise<boolean> {
  const config = defaultConfig

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
  const config = defaultConfig
  let sessionHandles = (await config.getSessions(userId)).map((session) => session.handle)
  return revokeMultipleSessions(sessionHandles)
}

export async function getPublicData(handle: string): Promise<PublicData> {
  const config = defaultConfig
  const session = await config.getSession(handle)
  if (!session) {
    throw new AuthenticationError("handle doesn't exist")
  }
  return JSON.parse(session.publicData) as PublicData
}

export async function getPrivateData(handle: string): Promise<PrivateData> {
  const config = defaultConfig
  const session = await config.getSession(handle)
  if (!session) {
    throw new AuthenticationError("handle doesn't exist")
  }
  return JSON.parse(session.privateData) as PrivateData
}

export async function setPrivateData(handle: string, data: PrivateData) {
  const config = defaultConfig

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

  const config = defaultConfig

  try {
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
