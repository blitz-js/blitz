import {useState} from "react"
import {COOKIE_CSRF_TOKEN} from "./constants"
import {Ctx} from "./middleware"
import {publicDataStore} from "./public-data-store"
import {IsAuthorizedArgs, PublicData} from "./types"
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
  isAuthorized: (data: {ctx: Ctx; args: any[]}) => boolean
}

export interface SessionContextBase extends PublicData {
  $handle: string | null
  $publicData: unknown
  $authorize(...args: IsAuthorizedArgs): asserts this is AuthenticatedSessionContext
  // $isAuthorized cannot have assertion return type because it breaks advanced use cases
  // with multiple isAuthorized calls
  $isAuthorized: (...args: IsAuthorizedArgs) => boolean
  $create: (publicData: PublicData, privateData?: Record<any, any>) => Promise<void>
  $revoke: () => Promise<void>
  $revokeAll: () => Promise<void>
  $getPrivateData: () => Promise<Record<any, any>>
  $setPrivateData: (data: Record<any, any>) => Promise<void>
  $setPublicData: (data: Partial<Omit<PublicData, "userId">>) => Promise<void>
}

// Could be anonymous
export interface SessionContext extends SessionContextBase {
  userId: PublicData["userId"] | null
  $publicData: Partial<PublicData>
}

export interface AuthenticatedSessionContext extends SessionContextBase {
  userId: PublicData["userId"]
  $publicData: PublicData
}

export const getAntiCSRFToken = () => readCookie(COOKIE_CSRF_TOKEN())

export interface PublicDataWithLoading extends PublicData {
  isLoading: boolean
}

interface UseSessionOptions {
  initialPublicData: PublicData
}

export const useSession: (options?: PublicDataWithInitialValues) => PublicDataWithLoading = (
  options?: PublicDataWithInitialValues,
) => {
  const [publicData, setPublicData] = useState(
    options?.initialPublicData ?? publicDataStore.emptyPublicData,
  )
  const [isLoading, setIsLoading] = useState(!options?.initialPublicData)

  useIsomorphicLayoutEffect(() => {
    // Initialize on mount
    setPublicData(publicDataStore.getData())
    setIsLoading(false)
    const subscription = publicDataStore.observable.subscribe(setPublicData)
    return subscription.unsubscribe
  }, [])

  return {...publicData, isLoading}
}
