import {AuthenticatedSessionContext, Ctx, PublicData, SessionContext} from "blitz"

export interface AuthenticatedClientSession extends PublicData {
  isLoading: boolean
}

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

declare module "blitz" {
  export interface Ctx {
    session: SessionContext
  }
  export interface MiddlewareCtx extends Omit<Ctx, "session"> {
    session: AuthenticatedSessionContext
  }
}

export type BlitzCtx = Ctx
