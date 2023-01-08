import {IncomingMessage, ServerResponse} from "http"
import {AuthOptions} from "next-auth"

export type BlitzNextAuthOptions = AuthOptions

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
) => void | Promise<void>
