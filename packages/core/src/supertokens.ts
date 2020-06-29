import {useState, useEffect} from "react"

export const TOKEN_SEPARATOR = ";"
export const HANDLE_SEPARATOR = ":"
export const SESSION_TYPE_OPAQUE_TOKEN_SIMPLE = "ots"
export const SESSION_TOKEN_VERSION_0 = "v0"

export const COOKIE_SESSION_TOKEN = "sSessionToken"
export const COOKIE_REFRESH_TOKEN = "sIdRefreshToken"

export const HEADER_CSRF = "anti-csrf"
export const HEADER_PUBLIC_DATA_TOKEN = "public-data-token"

export const LOCALSTORAGE_PREFIX = "_blitz-"

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

export class AuthenticationError extends Error {
  statusCode = 401 // Unauthorized
  constructor(message?: string) {
    super(message)
    this.name = "AuthenticationError"
  }
}
export class AuthorizationError extends Error {
  statusCode = 403 // Forbidden
  constructor(message?: string) {
    super(message)
    this.name = "AuthorizationError"
  }
}
export class CSRFTokenMismatchError extends Error {
  statusCode = 401 // Unauthorized
  constructor(message?: string) {
    super(message)
    this.name = "CSRFTokenMismatchError"
  }
}

export const parsePublicDataToken = (token: string) => {
  const [publicDataStr, expireAt] = atob(token).split(TOKEN_SEPARATOR)
  return {
    publicData: JSON.parse(publicDataStr) as PublicData,
    expireAt: new Date(expireAt),
  }
}

export const getPublicData = () => {
  const publicDataToken = localStorage.getItem(HEADER_PUBLIC_DATA_TOKEN)
  if (!publicDataToken) {
    return null
  }

  const {publicData, expireAt} = parsePublicDataToken(publicDataToken)

  if (expireAt < new Date()) {
    localStorage.removeItem(HEADER_CSRF)
    localStorage.removeItem(HEADER_PUBLIC_DATA_TOKEN)
    return null
  }
  return publicData
}

export const useSession = () => {
  const [publicData, setPublicData] = useState(getPublicData())

  useEffect(() => {
    const listener = (event: StorageEvent) => {
      if (event.key === HEADER_PUBLIC_DATA_TOKEN) {
        setPublicData(getPublicData())
      }
    }
    window.addEventListener("storage", listener)
    return () => window.removeEventListener("storage", listener)
  }, [])

  return publicData
}
