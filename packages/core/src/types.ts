import {BlitzApiRequest, BlitzApiResponse} from '.'
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

export interface MiddlewareRequest extends BlitzApiRequest {}
export interface MiddlewareResponse extends BlitzApiResponse {
  blitzCtx: Record<string, any>
  blitzResult: any
}
export type MiddlewareNext = (error?: Error) => Promise<void> | void

export type Middleware = (
  req: MiddlewareRequest,
  res: MiddlewareResponse,
  next: MiddlewareNext,
) => Promise<void>
