import {Ctx} from "blitz"

export interface Session {
  // isAuthorize can be injected here
  // PublicData can be injected here
}

export type PublicData = Session extends {PublicData: unknown}
  ? Session["PublicData"]
  : {userId: unknown}

export interface EmptyPublicData extends Partial<Omit<PublicData, "userId">> {
  userId: PublicData["userId"] | null
}

export interface ClientSession extends EmptyPublicData {
  isLoading: boolean
}

export interface AuthenticatedClientSession extends PublicData {
  isLoading: boolean
}

export type IsAuthorizedArgs = Session extends {
  isAuthorized: (...args: any) => any
}
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

export interface SessionConfigMethods {
  getSession: (handle: string) => Promise<SessionModel | null>
  getSessions: (userId: PublicData["userId"]) => Promise<SessionModel[]>
  createSession: (session: SessionModel) => Promise<SessionModel>
  updateSession: (
    handle: string,
    session: Partial<SessionModel>,
  ) => Promise<SessionModel | undefined>
  deleteSession: (handle: string) => Promise<SessionModel | undefined>
}

export interface SessionConfig extends SessionConfigMethods {
  cookiePrefix?: string
  sessionExpiryMinutes?: number
  method?: "essential" | "advanced"
  sameSite?: "none" | "lax" | "strict"
  secureCookies?: boolean
  domain?: string
  publicDataKeysToSyncAcrossSessions?: string[]
  isAuthorized: (data: {ctx: BlitzCtx; args: any}) => boolean
}

export interface SessionContextBase {
  $handle: string | null
  $publicData: unknown
  $authorize(...args: IsAuthorizedArgs): asserts this is AuthenticatedSessionContext
  // $isAuthorized cannot have assertion return type because it breaks advanced use cases
  // with multiple isAuthorized calls
  $isAuthorized: (...args: IsAuthorizedArgs) => boolean
  $thisIsAuthorized: (...args: IsAuthorizedArgs) => this is AuthenticatedSessionContext
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

declare module "blitz" {
  export interface Ctx {
    session: SessionContext
  }
}

export type BlitzCtx = Ctx
