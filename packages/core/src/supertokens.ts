import {useState} from "react"
import {publicDataStore} from "./public-data-store"
import {useIsomorphicLayoutEffect} from "./utils/hooks"
import {readCookie} from "./utils/cookie"

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

export interface DefaultPublicData {
  userId: any
  roles: string[]
}

export interface PublicData extends DefaultPublicData {}

export interface SessionModel extends Record<any, any> {
  handle: string
  userId?: PublicData["userId"]
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
  getSessions: (userId: PublicData["userId"]) => Promise<SessionModel[]>
  createSession: (session: SessionModel) => Promise<SessionModel>
  updateSession: (handle: string, session: Partial<SessionModel>) => Promise<SessionModel>
  deleteSession: (handle: string) => Promise<SessionModel>
  unstable_isAuthorized: (userRoles: string[], input?: any) => boolean
}

export interface SessionContextBase {
  userId: unknown
  roles: string[]
  handle: string | null
  publicData: unknown
  authorize(input?: any): asserts this is AuthenticatedSessionContext
  isAuthorized(input?: any): boolean
  // authorize: (roleOrRoles?: string | string[]) => void
  // isAuthorized: (roleOrRoles?: string | string[]) => boolean
  create: (publicData: PublicData, privateData?: Record<any, any>) => Promise<void>
  revoke: () => Promise<void>
  revokeAll: () => Promise<void>
  getPrivateData: () => Promise<Record<any, any>>
  setPrivateData: (data: Record<any, any>) => Promise<void>
  setPublicData: (data: Partial<Omit<PublicData, "userId">>) => Promise<void>
}

// Could be anonymous
export interface SessionContext extends SessionContextBase {
  userId: PublicData["userId"] | null
  publicData: Partial<PublicData>
}

export interface AuthenticatedSessionContext extends SessionContextBase {
  userId: PublicData["userId"]
  publicData: PublicData
}

export const getAntiCSRFToken = () => readCookie(COOKIE_CSRF_TOKEN)

export const parsePublicDataToken = (token: string) => {
  assert(token, "[parsePublicDataToken] Failed: token is empty")

  const [publicDataStr] = atob(token).split(TOKEN_SEPARATOR)
  try {
    const publicData: PublicData = JSON.parse(publicDataStr)
    return {
      publicData,
    }
  } catch (error) {
    throw new Error(`[parsePublicDataToken] Failed to parse publicDataStr: ${publicDataStr}`)
  }
}

export const useSession = () => {
  const [publicData, setPublicData] = useState(publicDataStore.emptyPublicData)
  const [isLoading, setIsLoading] = useState(true)

  useIsomorphicLayoutEffect(() => {
    // Initialize on mount
    setPublicData(publicDataStore.getData())
    setIsLoading(false)
    const subscription = publicDataStore.observable.subscribe(setPublicData)
    return subscription.unsubscribe
  }, [])

  return {...publicData, isLoading} as PublicData & {isLoading: boolean}
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
