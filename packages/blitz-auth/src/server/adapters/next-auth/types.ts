import type {Ctx, MiddlewareResponse} from "blitz"
import type {IncomingMessage} from "http"
import type {AuthOptions, Profile, User} from "next-auth"
import {SessionContext} from "../../../index-server"

export type BlitzNextAuthOptions = AuthOptions & {
  successRedirectUrl: string
  failureRedirectUrl: string
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
  res: MiddlewareResponse & {status: (statusCode: number) => any} & {json: (data: any) => any},
  ctx: Ctx,
) => void | Promise<void>
