import {IncomingMessage, ServerResponse} from "http"
import {AppProps as NextAppProps} from "next/app"
import {
  NextApiHandler,
  NextApiRequest,
  NextApiResponse,
  NextComponentType,
  NextPage,
  NextPageContext,
} from "next/types"
import type {UrlObject} from "url"
import {BlitzRuntimeData} from "./blitz-data"

export type {BlitzConfig} from "@blitzjs/config"
export type {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  GetStaticPaths,
  GetStaticPathsContext,
  GetStaticPathsResult,
  GetStaticProps,
  GetStaticPropsContext,
  GetStaticPropsResult,
  InferGetServerSidePropsType,
  InferGetStaticPropsType,
  PageConfig,
  Redirect,
} from "next"
export type BlitzApiHandler<T = any> = NextApiHandler<T>
export type BlitzApiRequest = NextApiRequest
export type BlitzApiResponse<T = any> = NextApiResponse<T>
export type BlitzPageContext = NextPageContext

export type BlitzComponentType<C = NextPageContext, IP = {}, P = {}> = NextComponentType<C, IP, P>

export interface AppProps<P = {}> extends NextAppProps<P> {
  Component: BlitzComponentType<NextPageContext, any, P> & BlitzPage
}
export type BlitzPage<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (component: JSX.Element) => JSX.Element
  authenticate?: boolean | {redirectTo?: string | RouteUrlObject}
  suppressFirstRenderFlicker?: boolean
  redirectAuthenticatedTo?: string | RouteUrlObject
}

export interface RouteUrlObject extends Pick<UrlObject, "pathname" | "query"> {
  pathname: string
}

export interface DefaultCtx {}
export interface Ctx extends DefaultCtx {}

export interface MiddlewareRequest extends BlitzApiRequest {
  protocol?: string
}
export interface MiddlewareResponse<C = Ctx> extends BlitzApiResponse {
  /**
   * This will be passed as the second argument to Blitz queries/mutations.
   *
   * You must set blitzCtx BEFORE calling next()
   */
  blitzCtx: C
  /**
   * This is the exact result returned from the Blitz query/mutation
   *
   * You must first `await next()` before reading this
   */
  blitzResult: unknown
}
export type MiddlewareNext = (error?: Error) => Promise<void> | void

export type Middleware<MiddlewareConfig = {}> = {
  (req: MiddlewareRequest, res: MiddlewareResponse, next: MiddlewareNext): Promise<void> | void
  type?: string
  config?: MiddlewareConfig
}

/**
 * Infer the type of the parameter from function that takes a single argument
 */
export type FirstParam<F extends QueryFn> = Parameters<F>[0]

/**
 * If type has a Promise, unwrap it. Otherwise return the original type
 */
export type Await<T> = T extends PromiseLike<infer U> ? U : T

/**
 * Ensure the type is a promise
 */
export type EnsurePromise<T> = T extends PromiseLike<unknown> ? T : Promise<T>

/**
 * Get the return type of a function which returns a Promise.
 */
export type PromiseReturnType<T extends (...args: any) => Promise<any>> = Await<ReturnType<T>>

export interface CancellablePromise<T> extends Promise<T> {
  cancel?: Function
}

export type QueryFn = (...args: any) => Promise<any>

export type Dict<T> = Record<string, T | undefined>

export type ParsedUrlQuery = Dict<string | string[]>

export type ParsedUrlQueryValue = string | string[] | undefined

export type Options = {
  fromQueryHook?: boolean
}

export type ConnectMiddleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (error?: Error) => void,
) => void

// The actual resolver source definition
export type Resolver<TInput, TResult> = (input: TInput, ctx?: any) => Promise<TResult>

// Resolver type when imported with require()
export type ResolverModule<TInput, TResult> = {
  default: Resolver<TInput, TResult>
  middleware?: Middleware[]
  config?: Record<string, any>
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
  config?: Record<string, any>
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
  namespace NodeJS {
    interface Global {
      __BLITZ_DATA__: BlitzRuntimeData
      _blitz_prismaClient: any
    }
  }
  interface Window {
    __BLITZ_DATA__: BlitzRuntimeData
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

export interface ErrorFallbackProps {
  error: Error & Record<any, any>
  resetErrorBoundary: (...args: Array<unknown>) => void
}
