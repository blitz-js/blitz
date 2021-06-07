/* eslint-disable es5/no-es6-methods  -- file only used on the server */
import {getConfig} from "@blitzjs/config"
import {getProjectRoot} from "@blitzjs/config"
// Must import this type from 'blitz'
import {log} from "@blitzjs/display"
import {fromBase64, toBase64} from "b64-lite"
import cookie from "cookie"
import {IncomingMessage, ServerResponse} from "http"
import {sign as jwtSign, verify as jwtVerify} from "jsonwebtoken"
import {getCookieParser} from "next/dist/next-server/server/api-utils"
import {join} from "path"
import {
  EmptyPublicData,
  IsAuthorizedArgs,
  PublicData,
  SessionConfig,
  SessionContext,
} from "../../auth/auth-types"
import {
  COOKIE_ANONYMOUS_SESSION_TOKEN,
  COOKIE_CSRF_TOKEN,
  COOKIE_PUBLIC_DATA_TOKEN,
  COOKIE_REFRESH_TOKEN,
  COOKIE_SESSION_TOKEN,
  HANDLE_SEPARATOR,
  HEADER_CSRF,
  HEADER_CSRF_ERROR,
  HEADER_PUBLIC_DATA_TOKEN,
  HEADER_SESSION_CREATED,
  HEADER_SESSION_REVOKED,
  SESSION_TOKEN_VERSION_0,
  SESSION_TYPE_ANONYMOUS_JWT,
  SESSION_TYPE_OPAQUE_TOKEN_SIMPLE,
  TOKEN_SEPARATOR,
} from "../../constants"
import {AuthenticationError, AuthorizationError, CSRFTokenMismatchError} from "../../errors"
import {BlitzApiRequest, BlitzApiResponse, Ctx, Middleware, MiddlewareResponse} from "../../types"
import {addMinutes, addYears, differenceInMinutes, isPast} from "../../utils/date-utils"
import {isLocalhost} from "../server-utils"
import {generateToken, hash256} from "./auth-utils"
const debug = require("debug")("blitz:session")

function assert(condition: any, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

// ----------------------------------------------------------------------------------------
// IMPORTANT: blitz.config.js must be loaded for session management config to be initialized
// This line ensures that blitz.config.js is loaded
// ----------------------------------------------------------------------------------------
process.nextTick(getConfig)

const getDb = () => {
  const projectRoot = getProjectRoot()
  const path = join(projectRoot, ".next/blitz/db.js")
  // eslint-disable-next-line no-eval -- block webpack from following this module path
  return eval("require")(path).default
}

const defaultConfig: SessionConfig = {
  sessionExpiryMinutes: 30 * 24 * 60, // Sessions expire after 30 days of being idle
  method: "essential",
  sameSite: "lax",
  publicDataKeysToSyncAcrossSessions: ["role", "roles"],
  getSession: (handle) => getDb().session.findFirst({where: {handle}}),
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
  isAuthorized: () => {
    throw new Error("No isAuthorized implementation provided")
  },
}

export interface SimpleRolesIsAuthorized<RoleType = string> {
  ({ctx, args}: {ctx: any; args: [roleOrRoles?: RoleType | RoleType[]]}): boolean
}

export const simpleRolesIsAuthorized: SimpleRolesIsAuthorized = ({ctx, args}) => {
  const [roleOrRoles] = args
  const publicData = (ctx.session as SessionContext).$publicData as
    | {roles: unknown}
    | {role: unknown}

  if ("role" in publicData && "roles" in publicData) {
    throw new Error("Session publicData can only have only `role` or `roles`, but not both.'")
  }

  let roles: string[] = []
  if ("role" in publicData) {
    if (typeof publicData.role !== "string") {
      throw new Error("Session publicData.role field must be a string")
    }
    roles.push(publicData.role)
  } else if ("roles" in publicData) {
    if (!Array.isArray(publicData.roles)) {
      throw new Error("Session `publicData.roles` is not an array, but it must be")
    }
    roles = publicData.roles
  } else {
    throw new Error("Session publicData is missing the required `role` or roles` field")
  }

  // No roles required, so all roles allowed
  if (!roleOrRoles) return true

  const rolesToAuthorize: string[] = []
  if (Array.isArray(roleOrRoles)) {
    rolesToAuthorize.push(...roleOrRoles)
  } else if (roleOrRoles) {
    rolesToAuthorize.push(roleOrRoles)
  }
  for (const role of rolesToAuthorize) {
    if (roles.includes(role)) return true
  }
  return false
}

// --------------------------------
// Middleware
// --------------------------------
export const sessionMiddleware = (sessionConfig: Partial<SessionConfig> = {}): Middleware => {
  assert(
    sessionConfig.isAuthorized,
    "You must provide an authorization implementation to sessionMiddleware as isAuthorized(userRoles, input)",
  )
  ;(global as any).__BLITZ_SESSION_MIDDLEWARE_USED = true

  global.sessionConfig = {
    ...defaultConfig,
    ...sessionConfig,
  }

  // Checks if cookie prefix from configuration has
  // non-alphanumeric characters and throws error
  const cookiePrefix = global.sessionConfig.cookiePrefix ?? "blitz"
  assert(
    cookiePrefix.match(/^[a-zA-Z0-9-_]+$/),
    `The cookie prefix used has invalid characters. Only alphanumeric characters, "-"  and "_" character are supported`,
  )

  const blitzSessionMiddleware: Middleware<{
    cookiePrefix?: string
  }> = async (req, res, next) => {
    debug("Starting sessionMiddleware...")
    if (!(res.blitzCtx as any).session) {
      // This function also saves session to res.blitzCtx
      await getSession(req, res)
    }
    return next()
  }

  blitzSessionMiddleware.config = {
    cookiePrefix,
  }
  return blitzSessionMiddleware
}

type JwtPayload = AnonymousSessionPayload | null
type AnonSessionKernel = {
  handle: string
  publicData: EmptyPublicData
  jwtPayload: JwtPayload
  antiCSRFToken: string
  anonymousSessionToken: string
}
type AuthedSessionKernel = {
  handle: string
  publicData: PublicData
  jwtPayload: JwtPayload
  antiCSRFToken: string
  sessionToken: string
}
type SessionKernel = AnonSessionKernel | AuthedSessionKernel

// const isBlitzApiRequest = (req: BlitzApiRequest | IncomingMessage): req is BlitzApiRequest => {
//   return "cookies" in req
// }
function ensureBlitzApiRequest(
  req: BlitzApiRequest | IncomingMessage,
): asserts req is BlitzApiRequest {
  if (!("cookies" in req)) {
    // Cookie parser isn't include inside getServerSideProps, so we have to add it
    ;(req as BlitzApiRequest).cookies = getCookieParser(req)()
  }
}
// const isMiddlewareApResponse = (
//   res: MiddlewareResponse | ServerResponse,
// ): res is MiddlewareResponse => {
//   return "blitzCtx" in res
// }
function ensureMiddlewareResponse(
  res: BlitzApiResponse | ServerResponse,
): asserts res is MiddlewareResponse {
  if (!("blitzCtx" in res)) {
    ;(res as MiddlewareResponse).blitzCtx = {} as Ctx
  }
}

export async function getSession(
  req: BlitzApiRequest | IncomingMessage,
  res: BlitzApiResponse | ServerResponse,
): Promise<SessionContext> {
  ensureBlitzApiRequest(req)
  ensureMiddlewareResponse(res)

  let response = res as MiddlewareResponse<{session?: SessionContext}>

  if (response.blitzCtx.session) {
    return response.blitzCtx.session
  }

  let sessionKernel = await getSessionKernel(req, res)

  if (sessionKernel) {
    debug("Got existing session", sessionKernel)
  }

  if (!sessionKernel) {
    debug("No session found, creating anonymous session")
    sessionKernel = await createAnonymousSession(req, res)
  }

  const sessionContext = makeProxyToPublicData(new SessionContextClass(req, res, sessionKernel))
  response.blitzCtx.session = sessionContext
  return sessionContext
}

const makeProxyToPublicData = <T extends SessionContextClass>(ctxClass: T): T => {
  return new Proxy(ctxClass, {
    get(target, prop, receiver) {
      if (prop in target || prop === "then") {
        return Reflect.get(target, prop, receiver)
      } else {
        return Reflect.get(target.$publicData, prop, receiver)
      }
    },
  })
}

export class SessionContextClass implements SessionContext {
  private _req: BlitzApiRequest
  private _res: MiddlewareResponse
  private _kernel: SessionKernel

  constructor(req: BlitzApiRequest, res: MiddlewareResponse, kernel: SessionKernel) {
    this._req = req
    this._res = res
    this._kernel = kernel
  }

  get $handle() {
    return this._kernel.handle
  }
  get userId() {
    return this._kernel.publicData.userId
  }
  get $publicData() {
    return this._kernel.publicData
  }

  $authorize(...args: IsAuthorizedArgs) {
    const e = new AuthenticationError()
    Error.captureStackTrace(e, this.$authorize)
    if (!this.userId) throw e

    if (!this.$isAuthorized(...args)) {
      const e = new AuthorizationError()
      Error.captureStackTrace(e, this.$authorize)
      throw e
    }
  }

  $isAuthorized(...args: IsAuthorizedArgs) {
    if (!this.userId) return false

    return global.sessionConfig.isAuthorized({ctx: this._res.blitzCtx, args})
  }

  async $create(publicData: PublicData, privateData?: Record<any, any>) {
    this._kernel = await createNewSession({
      req: this._req,
      res: this._res,
      publicData,
      privateData,
      jwtPayload: this._kernel.jwtPayload,
      anonymous: false,
    })
  }

  $revoke() {
    return revokeSession(this._req, this._res, this.$handle)
  }

  async $revokeAll() {
    if (!this.$publicData.userId) {
      throw new Error("session.revokeAll() cannot be used with anonymous sessions")
    }
    await revokeAllSessionsForUser(this._req, this._res, this.$publicData.userId)
    return
  }

  async $setPublicData(data: Record<any, any>) {
    if (this.userId) {
      await syncPubicDataFieldsForUserIfNeeded(this.userId, data)
    }
    this._kernel.publicData = await setPublicData(this._req, this._res, this._kernel, data)
  }

  async $getPrivateData() {
    return (await getPrivateData(this.$handle)) || {}
  }
  $setPrivateData(data: Record<any, any>) {
    return setPrivateData(this._kernel, data)
  }
}

// --------------------------------
// Token/handle utils
// --------------------------------
const TOKEN_LENGTH = 32

export const generateEssentialSessionHandle = () => {
  return generateToken(TOKEN_LENGTH) + HANDLE_SEPARATOR + SESSION_TYPE_OPAQUE_TOKEN_SIMPLE
}

export const generateAnonymousSessionHandle = () => {
  return generateToken(TOKEN_LENGTH) + HANDLE_SEPARATOR + SESSION_TYPE_ANONYMOUS_JWT
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
  return toBase64(
    [handle, generateToken(TOKEN_LENGTH), hash256(publicDataString), SESSION_TOKEN_VERSION_0].join(
      TOKEN_SEPARATOR,
    ),
  )
}
export const parseSessionToken = (token: string) => {
  const [handle, id, hashedPublicData, version] = fromBase64(token).split(TOKEN_SEPARATOR)

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

export const createPublicDataToken = (publicData: string | PublicData | EmptyPublicData) => {
  const payload = typeof publicData === "string" ? publicData : JSON.stringify(publicData)
  return toBase64(payload)
}

export const createAntiCSRFToken = () => generateToken(TOKEN_LENGTH)

export type AnonymousSessionPayload = {
  isAnonymous: true
  handle: string
  publicData: EmptyPublicData
  antiCSRFToken: string
}

export const getSessionSecretKey = () => {
  if (process.env.NODE_ENV === "production") {
    assert(
      process.env.SESSION_SECRET_KEY,
      "You must provide the SESSION_SECRET_KEY environment variable in production. This is used to sign and verify tokens. It should be 32 chars long.",
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
  const getCookieName = (c: string) => c.split("=", 2)[0]
  const appendCookie = () => append(res, "Set-Cookie", cookie)

  const cookiesHeader = res.getHeader("Set-Cookie")
  const cookieName = getCookieName(cookie)

  if (typeof cookiesHeader !== "string" && !Array.isArray(cookiesHeader)) {
    appendCookie()
    return
  }

  if (typeof cookiesHeader === "string") {
    if (cookieName === getCookieName(cookiesHeader)) {
      res.setHeader("Set-Cookie", cookie)
    } else {
      appendCookie()
    }
  } else {
    for (let i = 0; i < cookiesHeader.length; i++) {
      if (cookieName === getCookieName(cookiesHeader[i])) {
        cookiesHeader[i] = cookie
        res.setHeader("Set-Cookie", cookie)
        return
      }
    }
    appendCookie()
  }
}

export const setHeader = (res: ServerResponse, name: string, value: string) => {
  res.setHeader(name, value)
  if ("_blitz" in res) {
    ;(res as any)._blitz[name] = value
  }
}

export const removeHeader = (res: ServerResponse, name: string) => {
  res.removeHeader(name)
  if ("_blitz" in res) {
    delete (res as any)._blitz[name]
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
    cookie.serialize(COOKIE_SESSION_TOKEN(), sessionToken, {
      path: "/",
      httpOnly: true,
      secure:
        !process.env.DISABLE_SECURE_COOKIES &&
        process.env.NODE_ENV === "production" &&
        !isLocalhost(req),
      sameSite: global.sessionConfig.sameSite,
      domain: global.sessionConfig.domain,
      expires: expiresAt,
    }),
  )
}

export const setAnonymousSessionCookie = (
  req: IncomingMessage,
  res: ServerResponse,
  token: string,
  expiresAt: Date,
) => {
  setCookie(
    res,
    cookie.serialize(COOKIE_ANONYMOUS_SESSION_TOKEN(), token, {
      path: "/",
      httpOnly: true,
      secure:
        !process.env.DISABLE_SECURE_COOKIES &&
        process.env.NODE_ENV === "production" &&
        !isLocalhost(req),
      sameSite: global.sessionConfig.sameSite,
      domain: global.sessionConfig.domain,
      expires: expiresAt,
    }),
  )
}

export const setCSRFCookie = (
  req: IncomingMessage,
  res: ServerResponse,
  antiCSRFToken: string,
  expiresAt: Date,
) => {
  debug("setCSRFCookie", antiCSRFToken)
  setCookie(
    res,
    cookie.serialize(COOKIE_CSRF_TOKEN(), antiCSRFToken, {
      path: "/",
      secure:
        !process.env.DISABLE_SECURE_COOKIES &&
        process.env.NODE_ENV === "production" &&
        !isLocalhost(req),
      sameSite: global.sessionConfig.sameSite,
      domain: global.sessionConfig.domain,
      expires: expiresAt,
    }),
  )
}

export const setPublicDataCookie = (
  req: IncomingMessage,
  res: ServerResponse,
  publicDataToken: string,
  expiresAt: Date,
) => {
  setHeader(res, HEADER_PUBLIC_DATA_TOKEN, "updated")
  setCookie(
    res,
    cookie.serialize(COOKIE_PUBLIC_DATA_TOKEN(), publicDataToken, {
      path: "/",
      secure:
        !process.env.DISABLE_SECURE_COOKIES &&
        process.env.NODE_ENV === "production" &&
        !isLocalhost(req),
      sameSite: global.sessionConfig.sameSite,
      domain: global.sessionConfig.domain,
      expires: expiresAt,
    }),
  )
}

// --------------------------------
// Get Session
// --------------------------------
export async function getSessionKernel(
  req: BlitzApiRequest,
  res: ServerResponse,
): Promise<SessionKernel | null> {
  const anonymousSessionToken = req.cookies[COOKIE_ANONYMOUS_SESSION_TOKEN()]
  const sessionToken = req.cookies[COOKIE_SESSION_TOKEN()] // for essential method
  const idRefreshToken = req.cookies[COOKIE_REFRESH_TOKEN()] // for advanced method
  const enableCsrfProtection =
    req.method !== "GET" &&
    req.method !== "OPTIONS" &&
    req.method !== "HEAD" &&
    !process.env.DISABLE_CSRF_PROTECTION
  const antiCSRFToken = req.headers[HEADER_CSRF] as string

  if (sessionToken) {
    debug("[getSessionKernel] Request has sessionToken")
    const {handle, version, hashedPublicData} = parseSessionToken(sessionToken)

    if (!handle) {
      debug("No handle in sessionToken")
      return null
    }

    if (version !== SESSION_TOKEN_VERSION_0) {
      console.log(
        new AuthenticationError("Session token version is not " + SESSION_TOKEN_VERSION_0),
      )
      return null
    }
    debug("global session config", global.sessionConfig)
    const persistedSession = await global.sessionConfig.getSession(handle)
    if (!persistedSession) {
      debug("Session not found in DB")
      return null
    }
    if (persistedSession.hashedSessionToken !== hash256(sessionToken)) {
      debug("sessionToken hash did not match")
      debug("persisted: ", persistedSession.hashedSessionToken)
      debug("in req: ", hash256(sessionToken))
      return null
    }
    if (persistedSession.expiresAt && isPast(persistedSession.expiresAt)) {
      debug("Session expired")
      return null
    }
    if (enableCsrfProtection && persistedSession.antiCSRFToken !== antiCSRFToken) {
      if (!antiCSRFToken) {
        log.warning(
          `This request is missing the ${HEADER_CSRF} header. You can learn about adding this here: https://blitzjs.com/docs/session-management#manual-api-requests`,
        )
      }

      setHeader(res, HEADER_CSRF_ERROR, "true")
      throw new CSRFTokenMismatchError()
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
      const hasPublicDataChanged =
        hash256(persistedSession.publicData ?? undefined) !== hashedPublicData
      if (hasPublicDataChanged) {
        debug("PublicData has changed since the last request")
      }

      // Check if > 1/4th of the expiry time has passed
      // (since we are doing a rolling expiry window).
      const hasQuarterExpiryTimePassed =
        persistedSession.expiresAt &&
        differenceInMinutes(persistedSession.expiresAt, new Date()) <
          0.75 * (global.sessionConfig.sessionExpiryMinutes as number)

      if (hasQuarterExpiryTimePassed) {
        debug("quarter expiry time has passed")
        debug("Persisted expire time", persistedSession.expiresAt)
      }

      if (hasPublicDataChanged || hasQuarterExpiryTimePassed) {
        await refreshSession(
          req,
          res,
          {
            handle,
            publicData: JSON.parse(persistedSession.publicData || ""),
            jwtPayload: null,
            antiCSRFToken,
            sessionToken,
          },
          {publicDataChanged: hasPublicDataChanged},
        )
      }
    }

    return {
      handle,
      publicData: JSON.parse(persistedSession.publicData || ""),
      jwtPayload: null,
      antiCSRFToken,
      sessionToken,
    }
  } else if (idRefreshToken) {
    // TODO: advanced method
    return null
    // Important: check anonymousSessionToken token as the very last thing
  } else if (anonymousSessionToken) {
    debug("Request has anonymousSessionToken")
    const payload = parseAnonymousSessionToken(anonymousSessionToken)

    if (!payload) {
      debug("Payload empty")
      return null
    }

    if (enableCsrfProtection && payload.antiCSRFToken !== antiCSRFToken) {
      if (!antiCSRFToken) {
        log.warning(
          `This request is missing the ${HEADER_CSRF} header. You can learn about adding this here: https://blitzjs.com/docs/session-management#manual-api-requests`,
        )
      }

      setHeader(res, HEADER_CSRF_ERROR, "true")
      throw new CSRFTokenMismatchError()
    }

    return {
      handle: payload.handle,
      publicData: payload.publicData,
      jwtPayload: payload,
      antiCSRFToken,
      anonymousSessionToken,
    }
  }

  // No session exists
  return null
}

// --------------------------------
// Create Session
// --------------------------------
interface CreateNewAnonSession {
  req: IncomingMessage
  res: ServerResponse
  publicData: EmptyPublicData
  privateData?: Record<any, any>
  anonymous: true
  jwtPayload?: JwtPayload
}
interface CreateNewAuthedSession {
  req: IncomingMessage
  res: ServerResponse
  publicData: PublicData
  privateData?: Record<any, any>
  anonymous: false
  jwtPayload?: JwtPayload
}

export async function createNewSession(
  args: CreateNewAnonSession | CreateNewAuthedSession,
): Promise<SessionKernel> {
  const {req, res} = args
  assert(args.publicData.userId !== undefined, "You must provide publicData.userId")

  const antiCSRFToken = createAntiCSRFToken()

  if (args.anonymous) {
    debug("Creating new anonymous session")
    const handle = generateAnonymousSessionHandle()
    const payload: AnonymousSessionPayload = {
      isAnonymous: true,
      handle,
      publicData: args.publicData,
      antiCSRFToken,
    }
    const anonymousSessionToken = createAnonymousSessionToken(payload)
    const publicDataToken = createPublicDataToken(args.publicData)

    const expiresAt = addYears(new Date(), 30)
    setAnonymousSessionCookie(req, res, anonymousSessionToken, expiresAt)
    setCSRFCookie(req, res, antiCSRFToken, expiresAt)
    setPublicDataCookie(req, res, publicDataToken, expiresAt)
    // Clear the essential session cookie in case it was previously set
    setSessionCookie(req, res, "", new Date(0))
    removeHeader(res, HEADER_SESSION_REVOKED)
    setHeader(res, HEADER_SESSION_CREATED, "true")

    return {
      handle,
      publicData: args.publicData,
      jwtPayload: payload,
      antiCSRFToken,
      anonymousSessionToken,
    }
  } else if (global.sessionConfig.method === "essential") {
    debug("Creating new session")
    const newPublicData: PublicData = {
      // This carries over any public data from the anonymous session
      ...(args.jwtPayload?.publicData || {}),
      ...args.publicData,
    }
    assert(newPublicData.userId, "You must provide a non-empty userId as publicData.userId")

    // This carries over any private data from the anonymous session
    let existingPrivateData = {}
    if (args.jwtPayload?.isAnonymous) {
      const session = await global.sessionConfig.getSession(args.jwtPayload.handle)
      if (session) {
        if (session.privateData) {
          existingPrivateData = JSON.parse(session.privateData)
        }
        // Delete the previous anonymous session
        await global.sessionConfig.deleteSession(args.jwtPayload.handle)
      }
    }

    const newPrivateData: Record<any, any> = {
      ...existingPrivateData,
      ...args.privateData,
    }

    const expiresAt = addMinutes(new Date(), global.sessionConfig.sessionExpiryMinutes as number)
    const handle = generateEssentialSessionHandle()
    const sessionToken = createSessionToken(handle, newPublicData)
    const publicDataToken = createPublicDataToken(newPublicData)

    await global.sessionConfig.createSession({
      expiresAt,
      handle,
      userId: newPublicData.userId,
      hashedSessionToken: hash256(sessionToken),
      antiCSRFToken,
      publicData: JSON.stringify(newPublicData),
      privateData: JSON.stringify(newPrivateData),
    })

    setSessionCookie(req, res, sessionToken, expiresAt)
    setCSRFCookie(req, res, antiCSRFToken, expiresAt)
    setPublicDataCookie(req, res, publicDataToken, expiresAt)
    // Clear the anonymous session cookie in case it was previously set
    setAnonymousSessionCookie(req, res, "", new Date(0))
    removeHeader(res, HEADER_SESSION_REVOKED)
    setHeader(res, HEADER_SESSION_CREATED, "true")

    return {
      handle,
      publicData: newPublicData,
      jwtPayload: null,
      antiCSRFToken,
      sessionToken,
    }
  } else if (global.sessionConfig.method === "advanced") {
    throw new Error("The advanced method is not yet supported")
  } else {
    throw new Error(
      `Session management method ${global.sessionConfig.method} is invalid. Supported methods are "essential" and "advanced"`,
    )
  }
}

export async function createAnonymousSession(req: IncomingMessage, res: ServerResponse) {
  return await createNewSession({req, res, publicData: {userId: null}, anonymous: true})
}

// --------------------------------
// Session/DB utils
// --------------------------------

export async function refreshSession(
  req: IncomingMessage,
  res: ServerResponse,
  sessionKernel: SessionKernel,
  {publicDataChanged}: {publicDataChanged: boolean},
) {
  debug("Refreshing session", sessionKernel)
  if (sessionKernel.jwtPayload?.isAnonymous) {
    const payload: AnonymousSessionPayload = {
      ...sessionKernel.jwtPayload,
      publicData: sessionKernel.publicData,
    }
    const anonymousSessionToken = createAnonymousSessionToken(payload)
    const publicDataToken = createPublicDataToken(sessionKernel.publicData)

    const expiresAt = addYears(new Date(), 30)
    setAnonymousSessionCookie(req, res, anonymousSessionToken, expiresAt)
    setPublicDataCookie(req, res, publicDataToken, expiresAt)
    setCSRFCookie(req, res, sessionKernel.antiCSRFToken, expiresAt)
  } else if (global.sessionConfig.method === "essential" && "sessionToken" in sessionKernel) {
    const expiresAt = addMinutes(new Date(), global.sessionConfig.sessionExpiryMinutes as number)
    const publicDataToken = createPublicDataToken(sessionKernel.publicData)

    let sessionToken: string
    // Only generate new session token if public data actually changed
    // Otherwise if new session token is generated just for refresh, then
    // we have race condition bugs
    if (publicDataChanged) {
      sessionToken = createSessionToken(sessionKernel.handle, sessionKernel.publicData)
    } else {
      sessionToken = sessionKernel.sessionToken
    }

    setSessionCookie(req, res, sessionToken, expiresAt)
    setPublicDataCookie(req, res, publicDataToken, expiresAt)
    setCSRFCookie(req, res, sessionKernel.antiCSRFToken, expiresAt)

    debug("Updating session in db with", {expiresAt})
    if (publicDataChanged) {
      await global.sessionConfig.updateSession(sessionKernel.handle, {
        expiresAt,
        hashedSessionToken: hash256(sessionToken),
        publicData: JSON.stringify(sessionKernel.publicData),
      })
    } else {
      await global.sessionConfig.updateSession(sessionKernel.handle, {expiresAt})
    }
  } else if (global.sessionConfig.method === "advanced") {
    throw new Error("refreshSession() not implemented for advanced method")
  }
}

export async function getAllSessionHandlesForUser(userId: PublicData["userId"]) {
  return (await global.sessionConfig.getSessions(userId)).map((session) => session.handle)
}

export async function syncPubicDataFieldsForUserIfNeeded(
  userId: PublicData["userId"],
  data: Record<string, unknown>,
) {
  const dataToSync: Record<string, unknown> = {}
  global.sessionConfig.publicDataKeysToSyncAcrossSessions?.forEach((key) => {
    if (data[key]) {
      dataToSync[key] = data[key]
    }
  })
  if (Object.keys(dataToSync).length) {
    const sessions = await global.sessionConfig.getSessions(userId)

    for (const session of sessions) {
      const publicData = JSON.stringify({
        ...(session.publicData ? JSON.parse(session.publicData) : {}),
        ...dataToSync,
      })
      await global.sessionConfig.updateSession(session.handle, {publicData})
    }
  }
}

export async function revokeSession(
  req: IncomingMessage,
  res: ServerResponse,
  handle: string,
  anonymous: boolean = false,
): Promise<void> {
  debug("Revoking session", handle)
  if (!anonymous) {
    try {
      await global.sessionConfig.deleteSession(handle)
    } catch (error) {
      // Ignore any errors, like if session doesn't exist in DB
    }
  }
  // This is used on the frontend to clear localstorage
  setHeader(res, HEADER_SESSION_REVOKED, "true")

  // Clear all cookies
  setSessionCookie(req, res, "", new Date(0))
  setAnonymousSessionCookie(req, res, "", new Date(0))
  setCSRFCookie(req, res, "", new Date(0))
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
  userId: PublicData["userId"],
) {
  let sessionHandles = (await global.sessionConfig.getSessions(userId)).map(
    (session) => session.handle,
  )
  return revokeMultipleSessions(req, res, sessionHandles)
}

export async function getPublicData(
  sessionKernel: SessionKernel,
): Promise<PublicData | EmptyPublicData> {
  if (sessionKernel.jwtPayload?.publicData) {
    return sessionKernel.jwtPayload?.publicData
  } else {
    const session = await global.sessionConfig.getSession(sessionKernel.handle)
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
  const session = await global.sessionConfig.getSession(handle)
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
      await global.sessionConfig.createSession({handle: sessionKernel.handle})
    } catch (error) {}
    existingPrivateData = {}
  }
  const privateData = JSON.stringify({
    ...existingPrivateData,
    ...data,
  })
  await global.sessionConfig.updateSession(sessionKernel.handle, {privateData})
}

export async function setPublicData(
  req: IncomingMessage,
  res: ServerResponse,
  sessionKernel: SessionKernel,
  data: Record<any, any>,
) {
  // Don't allow updating userId
  delete data.userId

  const publicData = {
    ...(await getPublicData(sessionKernel)),
    ...data,
  } as PublicData

  await refreshSession(req, res, {...sessionKernel, publicData}, {publicDataChanged: true})
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
