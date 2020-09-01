import {useState} from "react"
import BadBehavior from "bad-behavior"
import {useIsomorphicLayoutEffect} from "./utils/hooks"

export const TOKEN_SEPARATOR = ";"
export const HANDLE_SEPARATOR = ":"
export const SESSION_TYPE_OPAQUE_TOKEN_SIMPLE = "ots"
export const SESSION_TYPE_ANONYMOUS_JWT = "ajwt"
export const SESSION_TOKEN_VERSION_0 = "v0"

export const COOKIE_ANONYMOUS_SESSION_TOKEN = "sAnonymousSessionToken"
export const COOKIE_SESSION_TOKEN = "sSessionToken"
export const COOKIE_REFRESH_TOKEN = "sIdRefreshToken"
export const COOKIE_CSRF_TOKEN = "sAntiCrfToken"
export const COOKIE_PUBLIC_DATA_TOKEN = "sPublicDataToken"

// Headers always all lower case
export const HEADER_CSRF = "anti-csrf"
export const HEADER_PUBLIC_DATA_TOKEN = "public-data-token"
export const HEADER_SESSION_REVOKED = "session-revoked"
export const HEADER_CSRF_ERROR = "csrf-error"

export const LOCALSTORAGE_PREFIX = "_blitz-"

function assert(condition: any, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

export interface PublicData extends Record<any, any> {
  userId: any
  roles: string[]
}

export interface SessionModel extends Record<any, any> {
  handle: string
  userId?: any
  expiresAt?: Date
  hashedSessionToken?: string
  antiCSRFToken?: string
  publicData?: string
  privateData?: string
}

export type SessionConfig = {
  sessionExpiryMinutes?: number
  method?: "essential" | "advanced"
  sameSite?: "none" | "lax" | "strict"
  getSession: (handle: string) => Promise<SessionModel | null>
  getSessions: (userId: any) => Promise<SessionModel[]>
  createSession: (session: SessionModel) => Promise<SessionModel>
  updateSession: (handle: string, session: Partial<SessionModel>) => Promise<SessionModel>
  deleteSession: (handle: string) => Promise<SessionModel>
  unstable_isAuthorized: (userRoles: string[], input?: any) => boolean
}

export interface SessionContext {
  /**
   * null if anonymous
   */
  userId: any
  roles: string[]
  handle: string | null
  publicData: PublicData
  authorize: (input?: any) => void
  isAuthorized: (input?: any) => boolean
  // authorize: (roleOrRoles?: string | string[]) => void
  // isAuthorized: (roleOrRoles?: string | string[]) => boolean
  create: (publicData: PublicData, privateData?: Record<any, any>) => Promise<void>
  revoke: () => Promise<void>
  revokeAll: () => Promise<void>
  getPrivateData: () => Promise<Record<any, any>>
  setPrivateData: (data: Record<any, any>) => Promise<void>
  setPublicData: (data: Record<any, any>) => Promise<void>
}

// Taken from https://github.com/HenrikJoreteg/cookie-getter
// simple commonJS cookie reader, best perf according to http://jsperf.com/cookie-parsing
export function readCookie(name: string) {
  if (typeof document === "undefined") return null
  const cookie = document.cookie
  const setPos = cookie.search(new RegExp("\\b" + name + "="))
  const stopPos = cookie.indexOf(";", setPos)
  let res
  if (!~setPos) return null
  res = decodeURIComponent(cookie.substring(setPos, ~stopPos ? stopPos : undefined).split("=")[1])
  return res.charAt(0) === "{" ? JSON.parse(res) : res
}

export const deleteCookie = (name: string) => setCookie(name, "", "Thu, 01 Jan 1970 00:00:01 GMT")

export const setCookie = (name: string, value: string, expires: string) => {
  const result = `${name}=${value};path=/;expires=${expires}`
  document.cookie = result
}

export const getAntiCSRFToken = () => readCookie(COOKIE_CSRF_TOKEN)
export const getPublicDataToken = () => readCookie(COOKIE_PUBLIC_DATA_TOKEN)

export const parsePublicDataToken = (token: string) => {
  assert(token, "[parsePublicDataToken] Failed - token is empty")

  const [publicDataStr, expireAt] = atob(token).split(TOKEN_SEPARATOR)
  let publicData: PublicData
  try {
    publicData = JSON.parse(publicDataStr)
  } catch (error) {
    throw new Error("Failed to parse publicDataToken: " + publicDataStr)
  }
  return {
    publicData,
    expireAt: expireAt && new Date(expireAt),
  }
}

const emptyPublicData: PublicData = {userId: null, roles: []}

export const publicDataStore = {
  eventKey: LOCALSTORAGE_PREFIX + "publicDataUpdated",
  observable: BadBehavior<PublicData>(),
  initialize() {
    if (typeof window !== "undefined") {
      // Set default value
      publicDataStore.updateState()
      window.addEventListener("storage", (event) => {
        if (event.key === this.eventKey) {
          publicDataStore.updateState()
        }
      })
    }
  },
  getToken() {
    return getPublicDataToken()
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
    // We use localStorage as a message bus between tabs.
    // Setting the current time in ms will cause other tabs to receive the `storage` event
    localStorage.setItem(this.eventKey, Date.now().toString())
    publicDataStore.observable.next(this.getData())
  },
  clear() {
    deleteCookie(COOKIE_PUBLIC_DATA_TOKEN)
    this.updateState()
  },
}
publicDataStore.initialize()

export const useSession = () => {
  const [publicData, setPublicData] = useState(emptyPublicData)
  const [isLoading, setIsLoading] = useState(true)

  useIsomorphicLayoutEffect(() => {
    // Initialize on mount
    setPublicData(publicDataStore.getData())
    setIsLoading(false)
    const subscription = publicDataStore.observable.subscribe(setPublicData)
    return subscription.unsubscribe
  }, [])

  return {...publicData, isLoading}
}

/*
 * This will ensure a user is logged in before using the query/mutation.
 * Optionally, as the second argument you can pass an array of roles
 * which will also be enforce.
 * Not logged in -> throw AuthenticationError
 * Role not matched -> throw AuthorizationError
 */
// TODO - returned type should accept the ctx argument with `session`
/*
 * DISABLING THIS FOR NOW - I think ctx.session.authorize is probably the best way
 */
// export const authorize = <T extends (input: any, ctx?: any) => any>(
//   resolverOrRoles: T | string[],
//   maybeResolver?: T,
// ) => {
//   let resolver: T
//   let roles: string[]
//   if (Array.isArray(resolverOrRoles)) {
//     roles = resolverOrRoles
//     resolver = maybeResolver as T
//   } else {
//     roles = []
//     resolver = resolverOrRoles
//   }
//
//   assert(resolver, "You must pass a query or mutation resolver function to authorize()")
//
//   return ((input: any, ctx?: {session?: SessionContext}) => {
//     if (!ctx?.session?.userId) throw new AuthenticationError()
//
//     // If user doesn't supply roles, then authorization is not checked
//     if (roles.length) {
//       let isAuthorized = false
//       for (const role of roles) {
//         if (ctx?.session?.roles.includes(role)) isAuthorized = true
//       }
//       if (!isAuthorized) throw new AuthorizationError()
//     }
//
//     return resolver(input, ctx)
//   }) as T
// }
