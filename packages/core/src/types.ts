import {IncomingMessage, ServerResponse} from "http"
import {MiddlewareRequest, MiddlewareResponse} from "./middleware"
import {AuthenticateOptions, Strategy} from "passport"
import {PublicData} from "./supertokens"

/**
 * Infer the type of the parameter from function that takes a single argument
 */
export type InferUnaryParam<F extends Function> = F extends (args: infer A) => any ? A : never

/**
 * Get the type of the value, that the Promise holds.
 */
export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T

/**
 * Get the return type of a function which returns a Promise.
 */
export type PromiseReturnType<T extends (...args: any) => Promise<any>> = PromiseType<ReturnType<T>>

export type QueryFn = (...args: any) => Promise<any>

export type ParsedUrlQueryValue = string | string[] | undefined

export type SsrQueryContext = {
  req: IncomingMessage
  res: ServerResponse
}

export type Options = {
  fromQueryHook?: boolean
  resultOfGetFetchMore?: any
}

export type MiddlewareNext = (error?: Error) => Promise<void> | void

export type Middleware = (
  req: MiddlewareRequest,
  res: MiddlewareResponse,
  next: MiddlewareNext,
) => Promise<void> | void

export type ConnectMiddleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (error?: Error) => void,
) => void

export type ResolverModule = {
  default: (args: any, ctx: any) => Promise<unknown>
  middleware?: Middleware[]
}

export type BlitzPassportConfig = {
  successRedirectUrl?: string
  errorRedirectUrl?: string
  authenticateOptions?: AuthenticateOptions
  strategies: Required<Strategy>[]
  secureProxy?: boolean
}

export type VerifyCallbackResult = {
  publicData: PublicData
  privateData?: Record<string, any>
  redirectUrl?: string
}
export {MiddlewareRequest, MiddlewareResponse}
