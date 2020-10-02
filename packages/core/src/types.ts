import {Middleware} from "./middleware"

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
    requestIdleCallback: (
      callback: (deadline: RequestIdleCallbackDeadline) => void,
      opts?: RequestIdleCallbackOptions,
    ) => RequestIdleCallbackHandle
    cancelIdleCallback: (handle: RequestIdleCallbackHandle) => void
  }
}
