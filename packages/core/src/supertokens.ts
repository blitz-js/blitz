import {useEffect, useState} from "react"
import {getBlitzRuntimeData} from "./blitz-data"
import {COOKIE_CSRF_TOKEN} from "./constants"
import {Ctx} from "./middleware"
import {publicDataStore} from "./public-data-store"
import {IsAuthorizedArgs, PublicData} from "./types"
import {readCookie} from "./utils/cookie"

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
  initialPublicData?: PublicData
  suspense?: boolean
}

export const useSession = (options: UseSessionOptions = {}): PublicDataWithLoading => {
  const suspense = options?.suspense ?? getBlitzRuntimeData().suspenseEnabled

  let initialState: PublicDataWithLoading
  if (options.initialPublicData) {
    initialState = {...options.initialPublicData, isLoading: false}
  } else if (suspense) {
    if (typeof window === "undefined") {
      throw new Promise((_) => {})
    } else {
      initialState = {...publicDataStore.getData(), isLoading: false}
    }
  } else {
    initialState = {...publicDataStore.emptyPublicData, isLoading: true}
  }

  const [session, setSession] = useState(initialState)

  useEffect(() => {
    // Initialize on mount
    setSession({...publicDataStore.getData(), isLoading: false})
    const subscription = publicDataStore.observable.subscribe((data) =>
      setSession({...data, isLoading: false}),
    )
    return subscription.unsubscribe
  }, [])

  return session
}
