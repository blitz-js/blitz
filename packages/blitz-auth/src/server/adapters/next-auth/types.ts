import type {Ctx, MiddlewareResponse} from "blitz"
import type {IncomingMessage, ServerResponse} from "http"
import type {Profile, User} from "next-auth"
import type {Provider} from "next-auth/providers"
import {SessionContext} from "../../../index-server"

export type BlitzNextAuthOptions = {
  successRedirectUrl: string
  failureRedirectUrl: string
  providers: Provider[]
  secureProxy?: boolean
  callback: (user: User, account: any, profile: Profile, session: SessionContext) => Promise<void>
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
  res: MiddlewareResponse & {status: (statusCode: number) => any},
  ctx: Ctx,
) => void | Promise<void>
