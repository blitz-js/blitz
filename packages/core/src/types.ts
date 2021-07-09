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

// The actual resolver source definition
export type Resolver<TInput, TResult> = (input: TInput, ctx?: any) => Promise<TResult>

// Resolver type when imported with require()
// export type ResolverModule<TInput, TResult> = {
//   default: Resolver<TInput, TResult>
//   middleware?: Middleware[]
//   config?: Record<string, any>
// }

export type ResolverType = "query" | "mutation"

// export interface ResolverEnhancement {
//   config?: Record<string, any>
//   _meta: {
//     name: string
//     type: ResolverType
//     filePath: string
//     apiUrl: string
//   }
// }

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
      _blitz_prismaClient: any
    }
  }
  interface Window {
    requestIdleCallback: (
      callback: (deadline: RequestIdleCallbackDeadline) => void,
      opts?: RequestIdleCallbackOptions,
    ) => RequestIdleCallbackHandle
    cancelIdleCallback: (handle: RequestIdleCallbackHandle) => void
  }
}

export interface ErrorFallbackProps {
  error: Error & Record<any, any>
  resetErrorBoundary: (...args: Array<unknown>) => void
}
