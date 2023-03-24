import type {AuthenticateOptions, Strategy} from "passport"
import type {IncomingMessage, ServerResponse} from "http"
import type {PublicData} from "../../../shared"
import type {Ctx, MiddlewareResponse} from "blitz"

export interface BlitzPassportConfigCallbackParams {
  ctx: Ctx
  req: IncomingMessage
  res: ServerResponse
}

export type BlitzPassportConfigCallback = ({
  ctx,
  req,
  res,
}: BlitzPassportConfigCallbackParams) => BlitzPassportConfigObject

export type BlitzPassportConfig = BlitzPassportConfigObject | BlitzPassportConfigCallback

export type BlitzPassportStrategy = {
  name?: string
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
  privateData?: Record<string, unknown>
  redirectUrl?: string
}

export type ApiHandlerIncomingMessage = IncomingMessage & {
  query: {
    [key: string]: string | string[] | undefined
  }
}

export type ApiHandler = (
  req: ApiHandlerIncomingMessage,
  res: MiddlewareResponse & {status: (statusCode: number) => any},
) => void | Promise<void>
