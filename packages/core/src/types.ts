import {BlitzConfig} from "@blitzjs/config"
import {IncomingMessage, ServerResponse} from "http"
import {NextRouter} from "next/router"
import {AuthenticateOptions, Strategy} from "passport"
import {MutateOptions, MutationResult} from "react-query"
import {BlitzApiRequest, BlitzApiResponse} from "."
import {useParams} from "./use-params"
import {useRouterQuery} from "./use-router-query"

export interface BlitzRouter extends NextRouter {
  query: ReturnType<typeof useRouterQuery>
  params: ReturnType<typeof useParams>
}

export interface DefaultPublicData {
  userId: any
  roles: string[]
}

export interface PublicData extends DefaultPublicData {}

export interface MiddlewareRequest extends BlitzApiRequest {
  protocol?: string
}
export interface MiddlewareResponse extends BlitzApiResponse {
  /**
   * This will be passed as the second argument to Blitz queries/mutations.
   *
   * You must set blitzCtx BEFORE calling next()
   */
  blitzCtx: Record<string, unknown>
  /**
   * This is the exact result returned from the Blitz query/mutation
   *
   * You must first `await next()` before reading this
   */
  blitzResult: unknown
}
export type MiddlewareNext = (error?: Error) => Promise<void> | void

export type Middleware = (
  req: MiddlewareRequest,
  res: MiddlewareResponse,
  next: MiddlewareNext,
) => Promise<void> | void

/**
 * Infer the type of the parameter from function that takes a single argument
 */
export type FirstParam<F extends QueryFn> = Parameters<F>[0]

/**
 * Get the type of the value, that the Promise holds.
 */
export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T

/**
 * Get the return type of a function which returns a Promise.
 */
export type PromiseReturnType<T extends (...args: any) => Promise<any>> = PromiseType<ReturnType<T>>

export interface CancellablePromise<T> extends Promise<T> {
  cancel?: Function
}

export type QueryFn = (...args: any) => Promise<any>

export type Dict<T> = Record<string, T | undefined>

export type ParsedUrlQuery = Dict<string | string[]>

export type ParsedUrlQueryValue = string | string[] | undefined

export type Options = {
  fromQueryHook?: boolean
  resultOfGetFetchMore?: any
}

export type ConnectMiddleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (error?: Error) => void,
) => void

export type BlitzPassportStrategy = {
  authenticateOptions?: AuthenticateOptions
  strategy: Strategy
}

export type BlitzPassportConfig = {
  successRedirectUrl?: string
  errorRedirectUrl?: string
  strategies: BlitzPassportStrategy[]
  secureProxy?: boolean
}

export type VerifyCallbackResult = {
  publicData: PublicData
  privateData?: Record<string, any>
  redirectUrl?: string
}

// The actual resolver source definition
export type Resolver<TInput, TResult> = (input: TInput, ctx?: any) => Promise<TResult>

// Resolver type when imported with require()
export type ResolverModule<TInput, TResult> = {
  default: Resolver<TInput, TResult>
  middleware?: Middleware[]
}

export type RpcOptions = {
  fromQueryHook?: boolean
  fromInvoke?: boolean
  alreadySerialized?: boolean
}

// The compiled rpc resolver available on client
export type ResolverRpc<TInput, TResult> = (
  input?: TInput,
  opts?: RpcOptions,
) => CancellablePromise<TResult>

export interface ResolverRpcExecutor<TInput, TResult> {
  (apiUrl: string, params: TInput, opts?: RpcOptions): CancellablePromise<TResult>
  warm: (apiUrl: string) => undefined | Promise<unknown>
}

export type ResolverType = "query" | "mutation"

export interface ResolverEnhancement {
  _meta: {
    name: string
    type: ResolverType
    filePath: string
    apiUrl: string
  }
}

export interface EnhancedResolver<TInput, TResult>
  extends Resolver<TInput, TResult>,
    ResolverEnhancement {
  middleware?: Middleware[]
}
export interface EnhancedResolverRpcClient<TInput, TResult>
  extends ResolverRpc<TInput, TResult>,
    ResolverEnhancement {}

type RequestIdleCallbackHandle = any
type RequestIdleCallbackOptions = {
  timeout: number
}
type RequestIdleCallbackDeadline = {
  readonly didTimeout: boolean
  timeRemaining: () => number
}

declare global {
  interface Window {
    __BLITZ_DATA__?: {config?: BlitzConfig}
    requestIdleCallback: (
      callback: (deadline: RequestIdleCallbackDeadline) => void,
      opts?: RequestIdleCallbackOptions,
    ) => RequestIdleCallbackHandle
    cancelIdleCallback: (handle: RequestIdleCallbackHandle) => void
  }
}

export type InvokeWithMiddlewareConfig = {
  req: IncomingMessage
  res: ServerResponse
  middleware?: Middleware[]
  [prop: string]: any
}

export declare type MutateFunction<
  TResult,
  TError = unknown,
  TVariables = unknown,
  TSnapshot = unknown
> = (
  variables?: TVariables,
  config?: MutateOptions<TResult, TError, TVariables, TSnapshot>,
) => Promise<TResult>

export declare type MutationResultPair<TResult, TError, TVariables, TSnapshot> = [
  MutateFunction<TResult, TError, TVariables, TSnapshot>,
  MutationResult<TResult, TError>,
]

export declare type MutationFunction<TResult, TVariables = unknown> = (
  variables: TVariables,
  ctx?: any,
) => Promise<TResult>
