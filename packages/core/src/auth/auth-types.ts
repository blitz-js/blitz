import type {AuthenticateOptions, Strategy} from "passport"
import {BlitzApiRequest, BlitzApiResponse, Ctx} from "../../types"

export interface Session {
  // isAuthorize can be injected here
  // PublicData can be injected here
}

declare global {
  namespace NodeJS {
    interface Global {
      sessionConfig: SessionConfig
    }
  }
}

export type PublicData = "PublicData" extends keyof Session
  ? Session["PublicData"]
  : {userId: unknown}

export interface EmptyPublicData extends Partial<Omit<PublicData, "userId">> {
  userId: PublicData["userId"] | null
}

export type IsAuthorizedArgs = "isAuthorized" extends keyof Session
  ? "args" extends keyof Parameters<Session["isAuthorized"]>[0]
    ? Parameters<Session["isAuthorized"]>[0]["args"]
    : unknown[]
  : unknown[]

export interface SessionModel extends Record<any, any> {
  handle: string
  userId?: PublicData["userId"] | null
  expiresAt?: Date | null
  hashedSessionToken?: string | null
  antiCSRFToken?: string | null
  publicData?: string | null
  privateData?: string | null
}

export type SessionConfig = {
  cookiePrefix?: string
  sessionExpiryMinutes?: number
  method?: "essential" | "advanced"
  sameSite?: "none" | "lax" | "strict"
  domain?: string
  publicDataKeysToSyncAcrossSessions?: string[]
  getSession: (handle: string) => Promise<SessionModel | null>
  getSessions: (userId: PublicData["userId"]) => Promise<SessionModel[]>
  createSession: (session: SessionModel) => Promise<SessionModel>
  updateSession: (handle: string, session: Partial<SessionModel>) => Promise<SessionModel>
  deleteSession: (handle: string) => Promise<SessionModel>
  isAuthorized: (data: {ctx: Ctx; args: any}) => boolean
}

export interface SessionContextBase {
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
export interface SessionContext extends SessionContextBase, EmptyPublicData {
  $publicData: Partial<PublicData> | EmptyPublicData
}

export interface AuthenticatedSessionContext extends SessionContextBase, PublicData {
  userId: PublicData["userId"]
  $publicData: PublicData
}

export interface ClientSession extends EmptyPublicData {
  isLoading: boolean
}

export interface AuthenticatedClientSession extends PublicData {
  isLoading: boolean
}

export interface BlitzPassportConfigCallbackParams {
  ctx: Ctx
  req: BlitzApiRequest
  res: BlitzApiResponse
}

export type BlitzPassportConfigCallback = ({
  ctx,
  req,
  res,
}: BlitzPassportConfigCallbackParams) => BlitzPassportConfigObject

export type BlitzPassportConfig = BlitzPassportConfigObject | BlitzPassportConfigCallback

export type BlitzPassportStrategy = {
  authenticateOptions?: AuthenticateOptions
  strategy: Strategy
}

export type BlitzPassportConfigObject = {
  successRedirectUrl?: string
  errorRedirectUrl?: string
  strategies: BlitzPassportStrategy[]
  secureProxy?: boolean
}

export type VerifyCallbackResult = {
  publicData: PublicData
  privateData?: Record<string, any>
  redirectUrl?: string
}
