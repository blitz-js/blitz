import {Router} from "blitz"
import {useState, useEffect} from "react"
import BadBehavior from "bad-behavior"
import invariant from "tiny-invariant"

export const TOKEN_SEPARATOR = ";"
export const HANDLE_SEPARATOR = ":"
export const SESSION_TYPE_OPAQUE_TOKEN_SIMPLE = "ots"
export const SESSION_TYPE_ANONYMOUS_JWT = "ajwt"
export const SESSION_TOKEN_VERSION_0 = "v0"

export const COOKIE_ANONYMOUS_SESSION_TOKEN = "sAnonymousSessionToken"
export const COOKIE_SESSION_TOKEN = "sSessionToken"
export const COOKIE_REFRESH_TOKEN = "sIdRefreshToken"

// Headers always all lower case
export const HEADER_CSRF = "anti-csrf"
export const HEADER_PUBLIC_DATA_TOKEN = "public-data-token"
export const HEADER_SESSION_REVOKED = "session-revoked"

export const LOCALSTORAGE_PREFIX = "_blitz-"

export interface PublicData extends Record<any, any> {
  userId: string | number | null
  roles: string[]
}

export interface SessionModel extends Record<any, any> {
  handle: string
  userId?: string | number
  expiresAt?: Date
  hashedSessionToken?: string
  antiCSRFToken?: string
  publicData?: string
  privateData?: string
}

export type SessionConfig = {
  sessionExpiryMinutes?: number
  method?: "essential" | "advanced"
  getSession: (handle: string) => Promise<SessionModel | null>
  getSessions: (userId: string | number) => Promise<SessionModel[]>
  createSession: (session: SessionModel) => Promise<SessionModel>
  updateSession: (handle: string, session: Partial<SessionModel>) => Promise<SessionModel>
  deleteSession: (handle: string) => Promise<SessionModel>
}

export interface SessionContext {
  /**
   * null if anonymous
   */
  userId: string | number | null
  roles: string[]
  handle: string | null
  publicData: PublicData
  authorize: (roleOrRoles?: string | string[]) => void
  isAuthorized: (roleOrRoles?: string | string[]) => boolean
  create: (publicData: PublicData, privateData?: Record<any, any>) => Promise<void>
  revoke: () => Promise<void>
  revokeAll: () => Promise<void>
  getPrivateData: () => Promise<Record<any, any>>
  setPrivateData: (data: Record<any, any>) => Promise<void>
  setPublicData: (data: Record<any, any>) => Promise<void>
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
  key: LOCALSTORAGE_PREFIX + HEADER_CSRF,
  setToken(token: string | undefined | null) {
    if (token) {
      localStorage.setItem(this.key, token)
    }
  },
  getToken() {
    try {
      return localStorage.getItem(this.key)
    } catch (error) {
      //ignore any errors
      return null
    }
  },
  clear() {
    localStorage.removeItem(this.key)
  },
}

export const parsePublicDataToken = (token: string) => {
  const [publicDataStr, expireAt] = atob(token).split(TOKEN_SEPARATOR)
  return {
    publicData: JSON.parse(publicDataStr) as PublicData,
    expireAt: expireAt && new Date(expireAt),
  }
}

const emptyPublicData: PublicData = {userId: null, roles: []}

let LOCK = false
export const publicDataStore = {
  key: "LOCALSTORAGE_PREFIX + HEADER_PUBLIC_DATA_TOKEN",
  observable: BadBehavior<PublicData>(),
  initialize() {
    if (typeof window !== "undefined") {
      // Set default value
      publicDataStore.updateState()

      window.addEventListener("storage", (event) => {
        if (event.key === this.key) {
          publicDataStore.updateState()
        }
      })
    }
  },
  setToken(token: string | undefined | null) {
    if (token) {
      localStorage.setItem(this.key, token)
      this.updateState()
    }
  },
  getToken() {
    try {
      return localStorage.getItem(this.key)
    } catch (error) {
      //ignore any errors
      return null
    }
  },
  getData(mount = false) {
    let publicDataToken

    // In case of OAuth login, the publicDataToken is set via query parameter
    const url = new URL(window.location.href)
    const query = new URLSearchParams(url.search)
    if (mount && !LOCK && query.get(HEADER_PUBLIC_DATA_TOKEN)) {
      // TODO
      // TODO move this out of here into a standalone function that can only run once on mount
      // TODO
      // TODO
      LOCK = true
      publicDataToken = query.get(HEADER_PUBLIC_DATA_TOKEN)

      query.delete(HEADER_PUBLIC_DATA_TOKEN)
      url.search = query.toString()
      console.log("new url:", url.href)
      // window.history.replaceState(
      //   {
      //     url: url.href,
      //   },
      //   document.title,
      // )
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      Router.replace({
        pathname: url.pathname,
        query: url.search,
      })
    } else {
      publicDataToken = this.getToken()
    }

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
    localStorage.removeItem(this.key)
    this.updateState()
  },
}
publicDataStore.initialize()

export const useSession = () => {
  const [publicData, setPublicData] = useState(emptyPublicData)

  useEffect(() => {
    // Initialize on mount
    setPublicData(publicDataStore.getData(true))
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
