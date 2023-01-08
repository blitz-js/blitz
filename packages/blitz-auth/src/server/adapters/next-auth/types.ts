import type {Ctx} from "blitz"
import type {IncomingMessage, ServerResponse} from "http"
import type {Profile, User} from "next-auth"
import type {Provider} from "next-auth/providers"

export type BlitzNextAuthOptions = {
  providers: Provider[]
  callback: (user: User, account: any, profile: Profile, ctx: Ctx) => Promise<void>
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
  res: ServerResponse & {status: (statusCode: number) => any} & {send: (body: string) => any},
  ctx: Ctx,
) => void | Promise<void>
