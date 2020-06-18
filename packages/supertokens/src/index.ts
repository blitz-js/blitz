import invariant from 'tiny-invariant'
import {v4 as uuidv4} from 'uuid'
import hasha, {HashaInput} from 'hasha'
import cookie from 'cookie'
import {BlitzApiRequest, BlitzApiResponse} from '@blitzjs/core'
import {addMinutes, isPast, differenceInMinutes} from 'date-fns'

const TOKEN_SEPARATOR = ';'
const HANDLE_SEPARATOR = ':'
const SESSION_TYPE_OPAQUE_TOKEN_SIMPLE = 'ots'
const SESSION_TOKEN_VERSION_0 = 'v0'

const COOKIE_SESSION_TOKEN = 'sSessionToken'
const COOKIE_REFRESH_TOKEN = 'sIdRefreshToken'

const HEADER_CSRF = 'anti-csrf'
const HEADER_PUBLIC_DATA_TOKEN = 'public-data-token'

export interface PublicData extends Record<any, unknown> {
  userId: string | number
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
  method: 'essential',
  apiDomain: 'example.com',
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
  async updateSession(session: Partial<SessionModel> & {handle: string}): Promise<SessionModel> {
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

// --------------------------------
// Session Class
// --------------------------------
class Session {
  private sessionHandle: string | undefined
  private publicData: PublicData | undefined
  public userId: string | undefined
  public role: string | undefined

  constructor(sessionHandle?: string, publicData?: PublicData) {
    if (sessionHandle) {
      this.sessionHandle = sessionHandle
    }
    if (publicData) {
      this.publicData = publicData
      this.userId = publicData.userId
      this.role = publicData.role
    }
  }

  create(publicData, privateData) {
    // TODO:
  }

  revoke() {
    if (this.sessionHandle !== undefined) {
      // TODO:
    }
  }

  getPrivateData() {
    if (this.sessionHandle !== undefined) {
      // TODO:
    } else {
      throw Error('no session exists')
    }
  }

  setPrivateData() {
    if (this.sessionHandle !== undefined) {
      // TODO:
    } else {
      throw Error('no session exists')
    }
  }

  getPublicData() {
    if (this.sessionHandle !== undefined) {
      // TODO:
    } else {
      throw Error('no session exists')
    }
  }

  setPublicData() {
    if (this.sessionHandle !== undefined) {
      // TODO:
    } else {
      throw Error('no session exists')
    }
  }
}

// --------------------------------
// General utils
// --------------------------------
const base64 = (input: HashaInput) => hasha(input, {encoding: 'base64'})
const hash = (input: HashaInput) => hasha(input, {algorithm: 'sha256'})

// --------------------------------
// Session utils
// --------------------------------
export const generateEssentialSessionHandle = () => {
  return uuidv4() + HANDLE_SEPARATOR + SESSION_TYPE_OPAQUE_TOKEN_SIMPLE
}

export const createSessionToken = (sessionHandle: string, publicData: PublicData) => {
  // We store the hashed public data in the opaque token so that when we verify,
  // we can detect changes in it and return a new set of tokens if necessary.
  return base64(
    [sessionHandle, uuidv4(), hash(JSON.stringify(publicData)), SESSION_TOKEN_VERSION_0].join(
      TOKEN_SEPARATOR,
    ),
  )
}
export const parseSessionToken = (token: string) => {
  const [sessionHandle, id, hashedPublicData, version] = token.split(TOKEN_SEPARATOR)
  return {
    sessionHandle,
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
    'Set-Cookie',
    cookie.serialize(COOKIE_SESSION_TOKEN, sessionToken, {
      //domain - can we omit?
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: true,
      expires: expiresAt,
    }),
  )
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

  invariant(publicData.userId, 'You must publicData.userId')
  invariant(publicData.role, 'You must publicData.role')

  const userId = publicData.userId.toString()

  if (config.method === 'essential') {
    const {
      sessionHandle,
      sessionToken,
      antiCSRFToken,
      publicDataToken,
      expiresAt,
    } = await createNewSessionHelper(userId, publicData, privateData)

    setSessionCookie(res, sessionToken, expiresAt)
    res.setHeader(HEADER_CSRF, antiCSRFToken)
    res.setHeader(HEADER_PUBLIC_DATA_TOKEN, publicDataToken)

    return {
      sessionHandle,
      publicData,
    }
  } else if (config.method === 'essential') {
    throw new Error('The advanced method is not yet supported')
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
  const sessionHandle = generateEssentialSessionHandle()
  const sessionToken = createSessionToken(sessionHandle, publicData)
  const publicDataToken = createPublicDataToken(JSON.stringify(publicData), expiresAt)
  const antiCSRFToken = createAntiCSRFToken()

  try {
    await config.createSession({
      handle: sessionHandle,
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
    sessionHandle,
    sessionToken,
    antiCSRFToken,
    publicDataToken,
    expiresAt,
  }
}

export function getSession(req: BlitzApiRequest, res: BlitzApiResponse, enableCsrfProtection: boolean) {
  let sessionToken = req.cookies[COOKIE_SESSION_TOKEN] // for essential method
  let idRefreshToken = req.cookies[COOKIE_REFRESH_TOKEN] // for advanced method

  if (sessionToken === undefined && idRefreshToken === undefined) {
    throw new AuthenticationError('Missing session tokens. Please login again')
  }

  if (sessionToken) {
    let antiCSRFToken = req.headers[HEADER_CSRF] as string
    let {sessionHandle, publicData, newSessionToken, newPublicDataToken, newExpiresAt} = getSessionHelper(
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
      sessionHandle,
      publicData,
    }
  } else {
    // TODO: advanced method
  }
}

export function getSessionHelper(
  sessionToken: string,
  inputAntiCSRFToken: string | undefined,
  enableCsrfProtection: boolean,
  httpMethod: string,
) {
  const config = defaultConfig

  const {sessionHandle, version, hashedPublicData} = parseSessionToken(sessionToken)

  if (version !== SESSION_TOKEN_VERSION_0) {
    throw new AuthenticationError('Session token is not ' + SESSION_TOKEN_VERSION_0)
  }

  let session = config.getSession(sessionHandle)

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
    revokeSession(sessionHandle)
    throw new AuthenticationError("Input session ID doesn't exist")
  }

  let newSessionToken
  let newPublicDataToken
  let newExpiresAt

  let quarterExpiryTimePassed
  // Only renew with non-GET requests
  // We can't reliably update the frontend expiry information in GET requests since they could
  // be from a browser level navigation (for example: user opening the site after a long time).
  if (httpMethod !== 'GET') {
    // Check if > 1/4th of the expiry time has passed
    // (since we are doing a rolling expiry window).
    quarterExpiryTimePassed =
      differenceInMinutes(session.expiresAt, new Date()) < 0.75 * config.sessionExpiryMinutes
  }

  const publicDataChanged = hash(session.publicData) !== hashedPublicData

  if (publicDataChanged || quarterExpiryTimePassed) {
    newExpiresAt = addMinutes(new Date(), config.sessionExpiryMinutes)
    newPublicDataToken = createPublicDataToken(session.publicData, newExpiresAt)
    newSessionToken = createSessionToken(sessionHandle, session.publicData)

    // should not wait for this to happen
    updateSessionExpiryInDb(sessionHandle, newExpiresAt)
  }
  return {
    sessionHandle,
    publicData: JSON.parse(session.publicData),
    newSessionToken,
    newPublicDataToken,
    newExpiresAt,
  }
}

export function refreshSession(req: BlitzApiRequest, res: BlitzApiResponse) {
  // TODO: advanced method
}

export async function updateSessionExpiryInDb(sessionHandle: string, expiresAt: Date) {
  const config = defaultConfig
  return await config.updateSession({handle: sessionHandle, expiresAt})
}

export async function getAllSessionHandlesForUser(userId: string) {
  const config = defaultConfig
  return (await config.getSessions(userId)).map((session) => session.handle)
}

export async function revokeSession(sessionHandle: string): Promise<boolean> {
  const config = defaultConfig

  return await config.deleteSession(sessionHandle)
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

export async function getPublicData(sessionHandle: string): Promise<PublicData> {
  const config = defaultConfig
  const session = await config.getSession(sessionHandle)
  if (!session) {
    throw new AuthenticationError("sessionHandle doesn't exist")
  }
  return JSON.parse(session.publicData) as PublicData
}

export async function getPrivateData(sessionHandle: string): Promise<PrivateData> {
  const config = defaultConfig
  const session = await config.getSession(sessionHandle)
  if (!session) {
    throw new AuthenticationError("sessionHandle doesn't exist")
  }
  return JSON.parse(session.privateData) as PrivateData
}

export function setPrivateData(sessionHandle: string, data: PrivateData) {
  const newData: PrivateData = {
    ...getPrivateData(sessionHandle),
    ...data,
  }
  // update <table> set sessionData = newData where session_handle = sessionHandle;
  // TODO
  // let numberOfRowsUpdated = updateInDb(sessionHandle, JSON.stringify(newData))
  const numberOfRowsUpdated = 1
  if (numberOfRowsUpdated === 0) {
    throw new AuthenticationError("sessionHandle doesn't exist")
  }
}

export function setPublicData(sessionHandle: string, data: Omit<PublicData, 'useId'>) {
  // Don't allow updating userId
  delete data.userId

  const newData: PrivateData = {
    ...getPrivateData(sessionHandle),
    ...data,
  }
  // update <table> set sessionData = newData where session_handle = sessionHandle;
  // TODO
  // let numberOfRowsUpdated = updateInDb(sessionHandle, JSON.stringify(newData))
  const numberOfRowsUpdated = 1
  if (numberOfRowsUpdated === 0) {
    throw new AuthenticationError("sessionHandle doesn't exist")
  }
}
