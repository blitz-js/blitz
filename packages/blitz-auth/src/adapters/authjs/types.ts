import type {Ctx, MiddlewareResponse} from "blitz"
import type {IncomingMessage} from "http"
import type {Account, Profile, User} from "@auth/core/types"
import type {AuthConfig} from "@auth/core"
import type {SessionContext} from "../../index-server"
import type {OAuthConfig} from "@auth/core/providers"

export type BlitzNextAuthOptions<P extends OAuthConfig<any>[]> = Omit<AuthConfig, "providers"> & {
  providers: P
  successRedirectUrl: string
  errorRedirectUrl: string
  secureProxy?: boolean
  csrf?: {
    enabled: boolean
  }
  callback: (
    user: User | undefined,
    account: Account | undefined,
    profile: P[number] extends OAuthConfig<infer T> ? T : Profile,
    session: SessionContext,
  ) => Promise<void | {redirectUrl: string}>
}

export type ApiHandlerIncomingMessage = IncomingMessage & {
  query: {
    [key: string]: string | string[] | undefined
  }
} & {
  body: {
    [key: string]: string | undefined
  }
}

export type BlitzNextAuthApiHandler = (
  req: ApiHandlerIncomingMessage,
  res: MiddlewareResponse & {status: (statusCode: number) => any} & {json: (data: any) => any},
  ctx: Ctx,
) => void | Promise<void>
