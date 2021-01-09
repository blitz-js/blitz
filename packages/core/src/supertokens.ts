import {useState} from "react"
import {COOKIE_CSRF_TOKEN} from "./constants"
import {publicDataStore} from "./public-data-store"
import {PublicData} from "./types"
import {readCookie} from "./utils/cookie"
import {useIsomorphicLayoutEffect} from "./utils/hooks"

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
  domain?: string
  getSession: (handle: string) => Promise<SessionModel | null>
  getSessions: (userId: PublicData["userId"]) => Promise<SessionModel[]>
  createSession: (session: SessionModel) => Promise<SessionModel>
  updateSession: (handle: string, session: Partial<SessionModel>) => Promise<SessionModel>
  deleteSession: (handle: string) => Promise<SessionModel>
  isAuthorized: (userRoles: string[], input?: any) => boolean
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

export interface PublicDataWithLoading extends PublicData {
  isLoading: boolean
}

export const useSession: () => PublicDataWithLoading = () => {
  const [publicData, setPublicData] = useState(publicDataStore.emptyPublicData)
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
