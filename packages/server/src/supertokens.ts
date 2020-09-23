import hasha, {HashaInput} from "hasha"
import cookie from "cookie"
import {nanoid} from "nanoid"
import {sign as jwtSign, verify as jwtVerify} from "jsonwebtoken"
import {
  BlitzApiRequest,
  BlitzApiResponse,
  Middleware,
  AuthenticationError,
  AuthorizationError,
  CSRFTokenMismatchError,
  SessionConfig,
  PublicData,
  SessionContext,
  TOKEN_SEPARATOR,
  HANDLE_SEPARATOR,
  SESSION_TYPE_OPAQUE_TOKEN_SIMPLE,
  SESSION_TYPE_ANONYMOUS_JWT,
  SESSION_TOKEN_VERSION_0,
  COOKIE_ANONYMOUS_SESSION_TOKEN,
  COOKIE_SESSION_TOKEN,
  COOKIE_REFRESH_TOKEN,
  COOKIE_CSRF_TOKEN,
  COOKIE_PUBLIC_DATA_TOKEN,
  HEADER_CSRF,
  HEADER_SESSION_REVOKED,
  HEADER_CSRF_ERROR,
  HEADER_PUBLIC_DATA_TOKEN,
  MiddlewareResponse,
  isLocalhost,
} from "@blitzjs/core"
import {getConfig} from "@blitzjs/config"
import pkgDir from "pkg-dir"
import {join} from "path"
import {addMinutes, addYears, isPast, differenceInMinutes} from "date-fns"
import {btoa, atob} from "b64-lite"
import {getCookieParser} from "next/dist/next-server/server/api-utils"
import {IncomingMessage, ServerResponse} from "http"
import {log} from "@blitzjs/display"

function assert(condition: any, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

// ----------------------------------------------------------------------------------------
// IMPORTANT: blitz.config.js must be loaded for session managment config to be initialized
// This line ensures that blitz.config.js is loaded
// ----------------------------------------------------------------------------------------
process.nextTick(getConfig)

const getDb = () => {
  const projectRoot = pkgDir.sync() || process.cwd()
  const path = join(projectRoot, ".next/__db.js")
  return require(path).default
}

const defaultConfig: SessionConfig = {
  sessionExpiryMinutes: 30 * 24 * 60, // Sessions expire after 30 days of being idle
  method: "essential",
  sameSite: "lax",
  getSession: (handle) => getDb().session.findOne({where: {handle}}),
  getSessions: (userId) => getDb().session.findMany({where: {userId}}),
  createSession: (session) => {
    let user
    if (session.userId) {
      user = {connect: {id: session.userId}}
    }
    return getDb().session.create({
      data: {...session, userId: undefined, user},
    })
  },
  updateSession: async (handle, session) => {
    try {
      return await getDb().session.update({where: {handle}, data: session})
    } catch (error) {
      // Session doesn't exist in DB for some reason, so create it
      if (error.code === "P2016") {
        log.warning("Could not update session because it's not in the DB")
      } else {
        throw error
      }
    }
  },
  deleteSession: (handle) => getDb().session.delete({where: {handle}}),
  unstable_isAuthorized: () => {
    throw new Error("No unstable_isAuthorized implementation provided")
  },
}

export function unstable_simpleRolesIsAuthorized(userRoles: string[], input?: any) {
  // No roles required, so all roles allowed
  if (!input) return true

  const rolesToAuthorize = []
  if (Array.isArray(input)) {
    rolesToAuthorize.push(...input)
  } else if (input) {
    rolesToAuthorize.push(input)
  }
  for (const role of rolesToAuthorize) {
    if (userRoles.includes(role)) return true
  }
  return false
}

let config: Required<SessionConfig>

// --------------------------------
// Middleware
// --------------------------------
export const sessionMiddleware = (sessionConfig: Partial<SessionConfig> = {}): Middleware => {
  assert(
    sessionConfig.unstable_isAuthorized,
    "You must provide an authorization implementation to sessionMiddleware as unstable_isAuthorized(userRoles, input)",
  )
  config = {
    ...defaultConfig,
    ...sessionConfig,
  } as Required<SessionConfig>

  return async (req, res, next) => {
    if (req.method !== "HEAD" && !res.blitzCtx.session) {
      // This function also saves session to res.blitzCtx
      await getSessionContext(req, res)
    }
    return next()
  }
}

type JwtPayload = AnonymousSessionPayload | null
type SessionKernel = {
  handle: string
  publicData: PublicData
  jwtPayload: JwtPayload
}

const isBlitzApiRequest = (req: BlitzApiRequest | IncomingMessage): req is BlitzApiRequest =>
  "cookies" in req
const isMiddlewareApResponse = (
  res: MiddlewareResponse | ServerResponse,
): res is MiddlewareResponse => "blitzCtx" in res

export async function getSessionContext(
  req: BlitzApiRequest | IncomingMessage,
  res: BlitzApiResponse | ServerResponse,
): Promise<SessionContext> {
  if (!("cookies" in req)) {
    // Cookie parser isn't include inside getServerSideProps, so we have to add it
    ;(req as BlitzApiRequest).cookies = getCookieParser(req)()
  }
  assert(isBlitzApiRequest(req), "[getSessionContext]: Request type isn't BlitzApiRequest")

  if (isMiddlewareApResponse(res) && res.blitzCtx.session) {
    return res.blitzCtx.session as SessionContext
  }

  let sessionKernel = await getSession(req, res)

  if (sessionKernel) {
    // console.log("Got existing session", sessionKernel)
  }

  if (!sessionKernel) {
    sessionKernel = await createAnonymousSession(req, res)
  }

  const sessionContext = new SessionContextClass(req, res, sessionKernel)
  if (!("blitzCtx" in res)) {
    ;(res as MiddlewareResponse).blitzCtx = {}
  }
  ;(res as MiddlewareResponse).blitzCtx.session = sessionContext
  return sessionContext
}

export class SessionContextClass implements SessionContext {
  private _req: IncomingMessage
  private _res: ServerResponse
  private _kernel: SessionKernel

  constructor(req: IncomingMessage, res: ServerResponse, kernel: SessionKernel) {
    this._req = req
    this._res = res
    this._kernel = kernel
  }

  get handle() {
    return this._kernel.handle
  }
  get userId() {
    return this._kernel.publicData.userId
  }
  get roles() {
    return this._kernel.publicData.roles
  }
  get publicData() {
    return this._kernel.publicData
  }

  authorize(input?: any) {
    if (!this.userId) throw new AuthenticationError()

    if (!this.isAuthorized(input)) {
      throw new AuthorizationError()
    }
  }

  isAuthorized(input?: any) {
    if (!this.userId) return false

    return config.unstable_isAuthorized(this.roles, input)
  }

  async create(publicData: PublicData, privateData?: Record<any, any>) {
    this._kernel = await createNewSession(this._req, this._res, publicData, privateData, {
      jwtPayload: this._kernel.jwtPayload,
    })
  }

  revoke() {
    return revokeSession(this._req, this._res, this.handle)
  }

  async revokeAll() {
    if (!this.publicData.userId) {
      throw new Error("session.revokeAll() cannot be used with anonymous sessions")
    }
    await revokeAllSessionsForUser(this._req, this._res, this.publicData.userId)
    return
  }

  async setPublicData(data: Record<any, any>) {
    if (this.userId && data.roles) {
      await updateAllPublicDataRolesForUser(this.userId, data.roles)
    }
    this._kernel.publicData = await setPublicData(this._req, this._res, this._kernel, data)
  }

  async getPrivateData() {
    return (await getPrivateData(this.handle)) || {}
  }
  setPrivateData(data: Record<any, any>) {
    return setPrivateData(this._kernel, data)
  }
}

// --------------------------------
// Token/handle utils
// --------------------------------
const hash = (input: HashaInput = "") => hasha(input, {algorithm: "sha256"})

export const generateToken = () => nanoid(32)

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
  isAnonymous: true
  handle: string
  publicData: PublicData
  antiCSRFToken: string
}

export const getSessionSecretKey = () => {
  if (process.env.NODE_ENV === "production") {
    assert(
      process.env.SESSION_SECRET_KEY,
      "You must provide the SESSION_SECRET_KEY environment variable in production. This used to sign and verify tokens. It should be 32 chars long.",
    )
    assert(
      process.env.SESSION_SECRET_KEY.length >= 32,
      "The SESSION_SECRET_KEY environment variable must be at least 32 bytes for sufficent token security",
    )

    return process.env.SESSION_SECRET_KEY
  } else {
    return process.env.SESSION_SECRET_KEY || "default-dev-secret"
  }
}

const JWT_NAMESPACE = "blitzjs"
const JWT_ISSUER = "blitzjs"
const JWT_AUDIENCE = "blitzjs"
const JWT_ANONYMOUS_SUBJECT = "anonymous"
const JWT_ALGORITHM = "HS256"

export const createAnonymousSessionToken = (payload: AnonymousSessionPayload) => {
  return jwtSign({[JWT_NAMESPACE]: payload}, getSessionSecretKey(), {
    algorithm: JWT_ALGORITHM,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    subject: JWT_ANONYMOUS_SUBJECT,
  })
}

export const parseAnonymousSessionToken = (token: string) => {
  // This must happen outside the try/catch because it could throw an error
  // about a missing environment variable
  const secret = getSessionSecretKey()

  try {
    const fullPayload = jwtVerify(token, secret, {
      algorithms: [JWT_ALGORITHM],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      subject: JWT_ANONYMOUS_SUBJECT,
    })

    if (typeof fullPayload === "object") {
      return (fullPayload as any)[JWT_NAMESPACE] as AnonymousSessionPayload
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

export const setCookie = (res: ServerResponse, cookie: string) => {
  append(res, "Set-Cookie", cookie)
}

export const setHeader = (res: ServerResponse, name: string, value: string) => {
  res.setHeader(name, value)
  if ("_blitz" in res) {
    ;(res as any)._blitz[name] = value
  }
}

export const setSessionCookie = (
  req: IncomingMessage,
  res: ServerResponse,
  sessionToken: string,
  expiresAt: Date,
) => {
  setCookie(
    res,
    cookie.serialize(COOKIE_SESSION_TOKEN, sessionToken, {
      path: "/",
      httpOnly: true,
      secure:
        !process.env.DISABLE_SECURE_COOKIES &&
        process.env.NODE_ENV === "production" &&
        !isLocalhost(req),
      sameSite: config.sameSite,
      expires: expiresAt,
    }),
  )
}

export const setAnonymousSessionCookie = (
  req: IncomingMessage,
  res: ServerResponse,
  token: string,
  expiresAt: Date = addYears(new Date(), 30),
) => {
  setCookie(
    res,
    cookie.serialize(COOKIE_ANONYMOUS_SESSION_TOKEN, token, {
      path: "/",
      httpOnly: true,
      secure:
        !process.env.DISABLE_SECURE_COOKIES &&
        process.env.NODE_ENV === "production" &&
        !isLocalhost(req),
      sameSite: config.sameSite,
      expires: expiresAt,
    }),
  )
}

export const setCSRFCookie = (
  req: IncomingMessage,
  res: ServerResponse,
  antiCSRFToken: string,
  expiresAt: Date = addYears(new Date(), 30),
) => {
  setCookie(
    res,
    cookie.serialize(COOKIE_CSRF_TOKEN, antiCSRFToken, {
      path: "/",
      secure:
        !process.env.DISABLE_SECURE_COOKIES &&
        process.env.NODE_ENV === "production" &&
        !isLocalhost(req),
      sameSite: config.sameSite,
      expires: expiresAt,
    }),
  )
}

export const setPublicDataCookie = (
  req: IncomingMessage,
  res: ServerResponse,
  publicDataToken: string,
  expiresAt: Date = addYears(new Date(), 30),
) => {
  setHeader(res, HEADER_PUBLIC_DATA_TOKEN, "updated")
  setCookie(
    res,
    cookie.serialize(COOKIE_PUBLIC_DATA_TOKEN, publicDataToken, {
      path: "/",
      secure:
        !process.env.DISABLE_SECURE_COOKIES &&
        process.env.NODE_ENV === "production" &&
        !isLocalhost(req),
      sameSite: config.sameSite,
      expires: expiresAt,
    }),
  )
}

// --------------------------------
// Get Session
// --------------------------------
export async function getSession(
  req: BlitzApiRequest,
  res: ServerResponse,
): Promise<SessionKernel | null> {
  const anonymousSessionToken = req.cookies[COOKIE_ANONYMOUS_SESSION_TOKEN]
  const sessionToken = req.cookies[COOKIE_SESSION_TOKEN] // for essential method
  const idRefreshToken = req.cookies[COOKIE_REFRESH_TOKEN] // for advanced method
  const enableCsrfProtection =
    req.method !== "GET" && req.method !== "OPTIONS" && !process.env.DISABLE_CSRF_PROTECTION
  const antiCSRFToken = req.headers[HEADER_CSRF] as string

  if (sessionToken) {
    const {handle, version, hashedPublicData} = parseSessionToken(sessionToken)

    if (!handle) {
      // console.log("No session: no handle")
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
      // console.log("No session: not in DB")
      return null
    }

    if (enableCsrfProtection && persistedSession.antiCSRFToken !== antiCSRFToken) {
      setHeader(res, HEADER_CSRF_ERROR, "true")
      throw new CSRFTokenMismatchError()
    }
    if (persistedSession.hashedSessionToken !== hash(sessionToken)) {
      // console.log("No session: sessionToken hash did not match")
      return null
    }
    if (persistedSession.expiresAt && isPast(persistedSession.expiresAt)) {
      await revokeSession(req, res, handle)
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

      // Check if > 1/4th of the expiry time has passed
      // (since we are doing a rolling expiry window).
      const hasQuarterExpiryTimePassed =
        persistedSession.expiresAt &&
        differenceInMinutes(persistedSession.expiresAt, new Date()) <
          0.75 * config.sessionExpiryMinutes

      if (hasPublicDataChanged || hasQuarterExpiryTimePassed) {
        await refreshSession(req, res, {
          handle,
          publicData: JSON.parse(persistedSession.publicData || ""),
          jwtPayload: null,
        })
      }
    }

    return {
      handle,
      publicData: JSON.parse(persistedSession.publicData || ""),
      jwtPayload: null,
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
      setHeader(res, HEADER_CSRF_ERROR, "true")
      throw new CSRFTokenMismatchError()
    }

    return {
      handle: payload.handle,
      publicData: payload.publicData,
      jwtPayload: payload,
    }
  }

  // No session exists
  return null
}

// --------------------------------
// Create Session
// --------------------------------
export async function createNewSession(
  req: IncomingMessage,
  res: ServerResponse,
  publicData: PublicData,
  privateData: Record<any, any> = {},
  opts: {anonymous?: boolean; jwtPayload?: JwtPayload} = {},
): Promise<SessionKernel> {
  assert(publicData.userId !== undefined, "You must provide publicData.userId")
  assert(publicData.roles, "You must provide publicData.roles")

  const antiCSRFToken = createAntiCSRFToken()

  if (opts.anonymous) {
    const handle = generateAnonymousSessionHandle()
    const payload: AnonymousSessionPayload = {
      isAnonymous: true,
      handle,
      publicData,
      antiCSRFToken,
    }
    const anonymousSessionToken = createAnonymousSessionToken(payload)
    const publicDataToken = createPublicDataToken(publicData)

    setAnonymousSessionCookie(req, res, anonymousSessionToken)
    setCSRFCookie(req, res, antiCSRFToken)
    setPublicDataCookie(req, res, publicDataToken)
    // Clear the essential session cookie in case it was previously set
    setSessionCookie(req, res, "", new Date(0))

    return {
      handle,
      publicData,
      jwtPayload: payload,
    }
  } else if (config.method === "essential") {
    const newPublicData: PublicData = {
      // This carries over any public data from the anonymous session
      ...(opts.jwtPayload?.publicData || {}),
      ...publicData,
    }
    assert(newPublicData.userId, "You must provide a non-empty userId as publicData.userId")

    // This carries over any private data from the anonymous session
    let existingPrivateData = {}
    if (opts.jwtPayload?.isAnonymous) {
      const session = await config.getSession(opts.jwtPayload.handle)
      if (session) {
        if (session.privateData) {
          existingPrivateData = JSON.parse(session.privateData)
        }
        // Delete the previous anonymous session
        await config.deleteSession(opts.jwtPayload.handle)
      }
    }

    const newPrivateData: Record<any, any> = {
      ...existingPrivateData,
      ...privateData,
    }

    const expiresAt = addMinutes(new Date(), config.sessionExpiryMinutes)
    const handle = generateEssentialSessionHandle()
    const sessionToken = createSessionToken(handle, newPublicData)
    const publicDataToken = createPublicDataToken(newPublicData, expiresAt)

    await config.createSession({
      expiresAt,
      handle,
      userId: newPublicData.userId,
      hashedSessionToken: hash(sessionToken),
      antiCSRFToken,
      publicData: JSON.stringify(newPublicData),
      privateData: JSON.stringify(newPrivateData),
    })

    setSessionCookie(req, res, sessionToken, expiresAt)
    setCSRFCookie(req, res, antiCSRFToken)
    setPublicDataCookie(req, res, publicDataToken)
    // Clear the anonymous session cookie in case it was previously set
    setAnonymousSessionCookie(req, res, "", new Date(0))

    return {
      handle,
      publicData: newPublicData,
      jwtPayload: null,
    }
  } else if (config.method === "advanced") {
    throw new Error("The advanced method is not yet supported")
  } else {
    throw new Error(
      `Session management method ${config.method} is invalid. Supported methods are "essential" and "advanced"`,
    )
  }
}

export async function createAnonymousSession(req: IncomingMessage, res: ServerResponse) {
  return await createNewSession(req, res, {userId: null, roles: []}, undefined, {anonymous: true})
}

// --------------------------------
// Session/DB utils
// --------------------------------

export async function refreshSession(
  req: IncomingMessage,
  res: ServerResponse,
  sessionKernel: SessionKernel,
) {
  if (sessionKernel.jwtPayload?.isAnonymous) {
    const payload: AnonymousSessionPayload = {
      ...sessionKernel.jwtPayload,
      publicData: sessionKernel.publicData,
    }
    const anonymousSessionToken = createAnonymousSessionToken(payload)
    const publicDataToken = createPublicDataToken(sessionKernel.publicData)

    setAnonymousSessionCookie(req, res, anonymousSessionToken)
    setPublicDataCookie(req, res, publicDataToken)
  } else if (config.method === "essential") {
    const expiresAt = addMinutes(new Date(), config.sessionExpiryMinutes)
    const sessionToken = createSessionToken(sessionKernel.handle, sessionKernel.publicData)
    const publicDataToken = createPublicDataToken(sessionKernel.publicData, expiresAt)

    setSessionCookie(req, res, sessionToken, expiresAt)
    setPublicDataCookie(req, res, publicDataToken)

    const hashedSessionToken = hash(sessionToken)

    await config.updateSession(sessionKernel.handle, {
      expiresAt,
      hashedSessionToken,
      publicData: JSON.stringify(sessionKernel.publicData),
    })
  } else if (config.method === "advanced") {
    throw new Error("refreshSession() not implemented for advanced method")
  }
}

export async function getAllSessionHandlesForUser(userId: string) {
  return (await config.getSessions(userId)).map((session) => session.handle)
}

export async function updateAllPublicDataRolesForUser(userId: string | number, roles: string[]) {
  const sessions = await config.getSessions(userId)

  for (const session of sessions) {
    const publicData = JSON.stringify({
      ...(session.publicData ? JSON.parse(session.publicData) : {}),
      roles,
    })
    await config.updateSession(session.handle, {publicData})
  }
}

export async function revokeSession(
  req: IncomingMessage,
  res: ServerResponse,
  handle: string,
): Promise<void> {
  try {
    await config.deleteSession(handle)
  } catch (error) {
    // Ignore any errors, like if session doesn't exist in DB
  }
  // This is used on the frontend to clear localstorage
  setHeader(res, HEADER_SESSION_REVOKED, "true")

  // Clear all cookies
  setSessionCookie(req, res, "", new Date(0))
  setAnonymousSessionCookie(req, res, "", new Date(0))
}

export async function revokeMultipleSessions(
  req: IncomingMessage,
  res: ServerResponse,
  sessionHandles: string[],
) {
  let revoked: string[] = []
  for (const handle of sessionHandles) {
    await revokeSession(req, res, handle)
    revoked.push(handle)
  }
  return revoked
}

export async function revokeAllSessionsForUser(
  req: IncomingMessage,
  res: ServerResponse,
  userId: string | number,
) {
  let sessionHandles = (await config.getSessions(userId)).map((session) => session.handle)
  return revokeMultipleSessions(req, res, sessionHandles)
}

export async function getPublicData(sessionKernel: SessionKernel): Promise<PublicData> {
  if (sessionKernel.jwtPayload?.publicData) {
    return sessionKernel.jwtPayload?.publicData
  } else {
    const session = await config.getSession(sessionKernel.handle)
    if (!session) {
      throw new Error("getPublicData() failed because handle doesn't exist " + sessionKernel.handle)
    }
    if (session.publicData) {
      return JSON.parse(session.publicData) as PublicData
    } else {
      return {} as PublicData
    }
  }
}

export async function getPrivateData(handle: string): Promise<Record<any, any> | null> {
  const session = await config.getSession(handle)
  if (session && session.privateData) {
    return JSON.parse(session.privateData) as Record<any, any>
  } else {
    return null
  }
}

export async function setPrivateData(sessionKernel: SessionKernel, data: Record<any, any>) {
  let existingPrivateData = await getPrivateData(sessionKernel.handle)
  if (existingPrivateData === null) {
    // Anonymous sessions may not exist in the DB yet
    try {
      await config.createSession({handle: sessionKernel.handle})
    } catch (error) {}
    existingPrivateData = {}
  }
  const privateData = JSON.stringify({
    ...existingPrivateData,
    ...data,
  })
  await config.updateSession(sessionKernel.handle, {privateData})
}

export async function setPublicData(
  req: IncomingMessage,
  res: ServerResponse,
  sessionKernel: SessionKernel,
  data: Record<any, any>,
) {
  // Don't allow updating userId
  delete data.userId

  const publicData: PublicData = {
    ...(await getPublicData(sessionKernel)),
    ...data,
  }

  await refreshSession(req, res, {...sessionKernel, publicData})
  return publicData
}

/**
 * Append additional header `field` with value `val`.
 *
 * Example:
 *
 *    append(res, 'Set-Cookie', 'foo=bar; Path=/; HttpOnly');
 *
 * @param {ServerResponse} res
 * @param {string} field
 * @param {string| string[]} val
 */
export function append(res: ServerResponse, field: string, val: string | string[]) {
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
