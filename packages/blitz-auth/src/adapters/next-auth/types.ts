import type {Ctx, MiddlewareResponse} from "blitz"
import type {IncomingMessage} from "http"
import type {AuthOptions, Profile, User} from "next-auth"

export type BlitzNextAuthOptions = AuthOptions & {
  successRedirectUrl: string
  errorRedirectUrl: string
  secureProxy?: boolean
  callback: (
    user: User,
    account: any,
    profile: Profile,
    session: Ctx["session"],
  ) => Promise<void | {redirectUrl: string}>
}

export type NextAuthApiHandlerIncomingMessage = IncomingMessage & {
  query: {
    [key: string]: string | string[] | undefined
  }
} & {
  body: {
    [key: string]: string | undefined
  }
}

export type BlitzNextAuthApiHandler = (
  req: NextAuthApiHandlerIncomingMessage,
  res: MiddlewareResponse & {status: (statusCode: number) => any} & {json: (data: any) => any},
  ctx: Ctx,
) => void | Promise<void>
