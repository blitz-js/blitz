import {useState, useEffect} from "react"
import BadBehavior from "bad-behavior"
import invariant from "tiny-invariant"

export const TOKEN_SEPARATOR = ";"
export const HANDLE_SEPARATOR = ":"
export const SESSION_TYPE_OPAQUE_TOKEN_SIMPLE = "ots"
export const SESSION_TOKEN_VERSION_0 = "v0"

export const COOKIE_SESSION_TOKEN = "sSessionToken"
export const COOKIE_REFRESH_TOKEN = "sIdRefreshToken"

export const HEADER_CSRF = "anti-csrf"
export const HEADER_PUBLIC_DATA_TOKEN = "public-data-token"
export const HEADER_SESSION_REVOKED = "session-revoked"

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

export type SessionContext = {
  /**
   * null if anonymous
   */
  userId: string | number | null
  roles: string[]
  handle: string | null
  publicData: PublicData
  authorize: (roleOrRoles: string | string[]) => void
  isAuthorized: (roleOrRoles: string | string[]) => boolean
  create: (publicData: PublicData, privateData?: PrivateData) => Promise<SessionContext>
  revoke: () => Promise<boolean>
  revokeAll: () => Promise<boolean>
  getPrivateData: () => Promise<PrivateData>
  setPrivateData: (data: PrivateData) => Promise<void>
  getPublicData: () => Promise<PublicData>
  setPublicData: (data: PublicData) => Promise<void>
  // TODO
  // regenerate: (arg: {publicData: PublicData}) => Promise<SessionContext>
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

export const antiCSRFStore = {
  setToken(token: string | undefined | null) {
    if (token) {
      localStorage.setItem(LOCALSTORAGE_PREFIX + HEADER_CSRF, token)
    }
  },
  getToken() {
    try {
      return localStorage.getItem(LOCALSTORAGE_PREFIX + HEADER_CSRF)
    } catch (error) {
      //ignore any errors
      return null
    }
  },
  clear() {
    localStorage.removeItem(LOCALSTORAGE_PREFIX + HEADER_CSRF)
  },
}

export const parsePublicDataToken = (token: string) => {
  const [publicDataStr, expireAt] = atob(token).split(TOKEN_SEPARATOR)
  return {
    publicData: JSON.parse(publicDataStr) as PublicData,
    expireAt: new Date(expireAt),
  }
}

const emptyPublicData: PublicData = {userId: null, roles: []}

export const publicDataStore = {
  observable: BadBehavior<PublicData>(),
  setToken(token: string | undefined | null) {
    if (token) {
      localStorage.setItem(LOCALSTORAGE_PREFIX + HEADER_PUBLIC_DATA_TOKEN, token)
      this.updateState()
    }
  },
  getToken() {
    try {
      return localStorage.getItem(LOCALSTORAGE_PREFIX + HEADER_PUBLIC_DATA_TOKEN)
    } catch (error) {
      //ignore any errors
      return null
    }
  },
  getData() {
    const publicDataToken = this.getToken()
    if (!publicDataToken) {
      return emptyPublicData
    }

    const {publicData, expireAt} = parsePublicDataToken(publicDataToken)

    if (expireAt < new Date()) {
      this.clear()
      return emptyPublicData
    }
    return publicData
  },
  updateState() {
    publicDataStore.observable.next(this.getData())
  },
  clear() {
    localStorage.removeItem(LOCALSTORAGE_PREFIX + HEADER_PUBLIC_DATA_TOKEN)
    this.updateState()
  },
}
// Set default value
publicDataStore.updateState()

export const useSession = () => {
  const [publicData, setPublicData] = useState(emptyPublicData)

  useEffect(() => {
    // Initialize on mount
    setPublicData(publicDataStore.getData())
    const subscription = publicDataStore.observable.subscribe(setPublicData)
    return subscription.unsubscribe
  }, [])

  return publicData
}

/*
 * This will ensure a user is logged in before using the query/mutation.
 * Optionally, as the second argument you can pass an array of roles
 * which will also be enforce.
 * Not logged in -> throw AuthenticationError
 * Role not matched -> throw AuthorizationError
 */
// TODO - returned type should accept the ctx argument with `session`
export const authorize = <T extends (input: any, ctx?: any) => any>(
  resolverOrRoles: T | string[],
  maybeResolver?: T,
) => {
  let resolver: T
  let roles: string[]
  if (Array.isArray(resolverOrRoles)) {
    roles = resolverOrRoles
    resolver = maybeResolver as T
  } else {
    roles = []
    resolver = resolverOrRoles
  }

  invariant(resolver, "You must pass a query or mutation resolver function to authorize()")

  return ((input: any, ctx?: {session?: SessionContext}) => {
    if (!ctx?.session?.userId) throw new AuthenticationError()

    // If user doesn't supply roles, then authorization is not checked
    if (roles.length) {
      let isAuthorized = false
      for (const role of roles) {
        if (ctx?.session?.roles.includes(role)) isAuthorized = true
      }
      if (!isAuthorized) throw new AuthorizationError()
    }

    return resolver(input, ctx)
  }) as T
}
