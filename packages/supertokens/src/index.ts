import invariant from 'tiny-invariant'
import {v4 as uuidv4} from 'uuid'
import hasha, {HashaInput} from 'hasha'
import cookie from 'cookie'
import {BlitzApiRequest, BlitzApiResponse} from '@blitzjs/core'
import {addMinutes} from 'date-fns'

const TOKEN_SEPARATOR = ';'
const HANDLE_SEPARATOR = ':'
const SESSION_TYPE_OPAQUE_TOKEN_SIMPLE = 'ots'
const ACCESS_TOKEN_VERSION_0 = 'v0'

export interface PublicData extends Record<any, unknown> {
  userId: string | number
  role: string
}
export type PrivateData = Record<any, unknown>

const defaultConfig = {
  sessionExpiryMinutes: 100,
  method: 'essential',
  apiDomain: 'example.com',
}

// --------------------------------
// Errors
// --------------------------------

class AuthenticationError extends Error {
  // TODO implement constructor and custom name
}

// --------------------------------
// utils
// --------------------------------
const base64 = (input: HashaInput) => hasha(input, {encoding: 'base64'})
const hash = (input: HashaInput) => hasha(input, {algorithm: 'sha256'})

export const generateEssentialSessionHandle = () => {
  return uuidv4() + HANDLE_SEPARATOR + SESSION_TYPE_OPAQUE_TOKEN_SIMPLE
}

export const createAccessToken = (sessionHandle: string, publicData: PublicData) => {
  // We store the hashed public data in the opaque token so that when we verify,
  // we can detect changes in it and return a new set of tokens if necessary.
  return base64(
    [sessionHandle, uuidv4(), hash(JSON.stringify(publicData)), ACCESS_TOKEN_VERSION_0].join(TOKEN_SEPARATOR),
  )
}

export const createPublicDataToken = (publicData: PublicData, expiry: number) => {
  return base64([JSON.stringify(publicData), expiry].join(TOKEN_SEPARATOR))
}

export const createAntiCSRFToken = () => uuidv4()

// --------------------------------
// createNewSession()
// --------------------------------
export function createNewSession(
  res: BlitzApiResponse,
  publicData: PublicData,
  privateData: PrivateData = {},
) {
  const config = defaultConfig

  invariant(publicData.userId, 'You must publicData.userId')
  invariant(publicData.role, 'You must publicData.role')

  const userId = publicData.userId.toString()

  if (config.method === 'essential') {
    const {sessionHandle, accessToken, antiCSRFToken, publicDataToken, expiresAt} = createNewSessionHelper(
      userId,
      publicData,
      privateData,
    )

    // TODO - what if another middlware use `Set-Cookie`?
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('sSessionToken', accessToken, {
        //domain - can we omit?
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: true,
        expires: expiresAt,
      }),
    )
    res.setHeader('anti-csrf', antiCSRFToken)
    res.setHeader('public-data-token', publicDataToken)

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

export function createNewSessionHelper(userId: string, publicData: PublicData, privateData: PrivateData) {
  const config = defaultConfig

  const createdAt = new Date()
  const expiresAt = addMinutes(createdAt, config.sessionExpiryMinutes)
  const sessionHandle = generateEssentialSessionHandle()
  const accessToken = createAccessToken(sessionHandle, publicData)
  const publicDataToken = createPublicDataToken(publicData, config.sessionExpiryMinutes)
  const antiCSRFToken = createAntiCSRFToken()

  storeNewSessionInDb(
    sessionHandle,
    userId,
    accessToken,
    antiCSRFToken,
    publicData,
    privateData,
    expiresAt,
    createdAt,
  )

  return {
    sessionHandle,
    accessToken,
    antiCSRFToken,
    publicDataToken,
    expiresAt,
  }
}

export function refreshSession(req: BlitzApiRequest, res: BlitzApiResponse) {
  // TODO: advanced method
}

// --------------------------------
// storeNewSessionInDb()
// --------------------------------
export function storeNewSessionInDb(
  sessionHandle: string,
  userId: string,
  accessToken: string,
  antiCSRFToken: string,
  publicData: PublicData,
  privateData: PrivateData,
  expiresAt: Date,
  createdAt: Date,
) {
  // table structure will be:
  //  session_handle: varchar(35) Primary key
  //  user_id TEXT
  //  session_token_hash: TEXT
  //  antiCSRFToken: TEXT
  //  public_data TEXT
  //  session_data TEXT
  //  expires_at BIGINT
  //  created_at_time BIGINT

  // TODO
  // createInDb
  console.log(
    'CREATE IN DB HERE',
    sessionHandle,
    userId,
    hash(accessToken),
    antiCSRFToken,
    JSON.stringify(publicData),
    JSON.stringify(privateData),
    expiresAt,
    createdAt,
  )
}

export function updateSessionExpiryInDb(sessionHandle: string, expiresAt: Date) {
  // update <table> set expires_at = expiresAt where session_handle = sessionHandle;
  // TODO
  // updateInDb
  console.log('UPDATE DB', sessionHandle, expiresAt)
}

export function getAllSessionHandlesForUser(userId: string): string[] {
  // select sessionHandle from <table> where user_id = userId;
  // TODO
  // return readFromDb(userId)
  return []
}

export function revokeSession(sessionHandle: string): boolean {
  // delete from <table> where session_handle = sessionHandle;
  // TODO
  // return deleteFromDb(sessionHandle) === 1;
  return true
}

export function revokeMultipleSessions(sessionHandles: string[]): string[] {
  let revoked: string[] = []
  for (const handle of sessionHandles) {
    if (revokeSession(handle)) {
      revoked.push(handle)
    }
  }
  return revoked
}

// returns list of revoked session for this user
export function revokeAllSessionsForUser(userId: string): string[] {
  // multiple ways to implement this. Ideally we want to delete from the db
  // directly based on userId, however, that may not give us the list of sessionHandles...?
  let sessionHandles: string[] = getAllSessionHandlesForUser(userId)
  return revokeMultipleSessions(sessionHandles)
}

export function getPublicData(sessionHandle: string) {
  // select sessionData from <table> where session_handle = sessionHandle;
  // TODO
  // const data = readFromDb(sessionHandle);
  const data = {}
  if (data === undefined) {
    throw new AuthenticationError("sessionHandle doesn't exist")
  }
  return data
}

export function getPrivateData(sessionHandle: string) {
  // select sessionData from <table> where session_handle = sessionHandle;
  // TODO
  // const data = readFromDb(sessionHandle);
  const data = {}
  if (data === undefined) {
    throw new AuthenticationError("sessionHandle doesn't exist")
  }
  return data
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
