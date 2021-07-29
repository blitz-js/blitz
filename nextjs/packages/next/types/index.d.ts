/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

import React from 'react'
import { ParsedUrlQuery } from 'querystring'
import { IncomingMessage, ServerResponse } from 'http'

import {
  NextPageContext,
  NextComponentType,
  NextApiResponse,
  NextApiRequest,
  NextApiHandler,
  DefaultCtx,
  Ctx,
  MiddlewareRequest,
  MiddlewareResponse,
  MiddlewareNext,
  Middleware,
  ConnectMiddleware,
  Session,
  PublicData,
  EmptyPublicData,
  IsAuthorizedArgs,
  SessionModel,
  SessionConfig,
  SessionContext,
  SessionContextBase,
  AuthenticatedSessionContext,
  ClientSession,
  AuthenticatedClientSession,
  // @ts-ignore This path is generated at build time and conflicts otherwise
} from '../dist/next-server/lib/utils'

import {
  NextApiRequestCookies,
  // @ts-ignore This path is generated at build time and conflicts otherwise
} from '../dist/next-server/server/api-utils'

// @ts-ignore This path is generated at build time and conflicts otherwise
// export { PaginateArgs, ConnectMiddleware } from './dist/stdlib-server'

// @ts-ignore This path is generated at build time and conflicts otherwise
import next from '../dist/server/next'

export default next

export {
  NextPageContext,
  NextComponentType,
  NextApiResponse,
  NextApiRequest,
  NextApiHandler,
  DefaultCtx,
  Ctx,
  MiddlewareRequest,
  MiddlewareResponse,
  MiddlewareNext,
  Middleware,
  ConnectMiddleware,
  Session,
  PublicData,
  EmptyPublicData,
  IsAuthorizedArgs,
  SessionModel,
  SessionConfig,
  SessionContext,
  SessionContextBase,
  AuthenticatedSessionContext,
  ClientSession,
  AuthenticatedClientSession,
}

// Extend the React types with missing properties
declare module 'react' {
  // <html amp=""> support
  interface HtmlHTMLAttributes<T> extends React.HTMLAttributes<T> {
    amp?: string
  }

  // <link nonce=""> support
  interface LinkHTMLAttributes<T> extends HTMLAttributes<T> {
    nonce?: string
  }

  // <style jsx> and <style jsx global> support for styled-jsx
  interface StyleHTMLAttributes<T> extends HTMLAttributes<T> {
    jsx?: boolean
    global?: boolean
  }
}

export type Redirect =
  | {
      statusCode: 301 | 302 | 303 | 307 | 308
      destination: string
      basePath?: false
    }
  | {
      permanent: boolean
      destination: string
      basePath?: false
    }

/**
 * `Page` type, use it as a guide to create `pages`.
 */
export type NextPage<P = {}, IP = P> = NextComponentType<NextPageContext, IP, P>

/**
 * `Config` type, use it for export const config
 */
export type PageConfig = {
  amp?: boolean | 'hybrid'
  api?: {
    /**
     * The byte limit of the body. This is the number of bytes or any string
     * format supported by `bytes`, for example `1000`, `'500kb'` or `'3mb'`.
     */
    bodyParser?: { sizeLimit?: number | string } | false
    /**
     * Flag to disable warning "API page resolved
     * without sending a response", due to explicitly
     * using an external API resolver, like express
     */
    externalResolver?: true
  }
  env?: Array<string>
  unstable_runtimeJS?: false
  unstable_JsPreload?: false
}

export type PreviewData = string | false | object | undefined

export type GetStaticPropsContext<Q extends ParsedUrlQuery = ParsedUrlQuery> = {
  params?: Q
  preview?: boolean
  previewData?: PreviewData
  locale?: string
  locales?: string[]
  defaultLocale?: string
}

export type GetStaticPropsResult<P> =
  | { props: P; revalidate?: number | boolean }
  | { redirect: Redirect; revalidate?: number | boolean }
  | { notFound: true }

export type GetStaticProps<
  P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery
> = (
  context: GetStaticPropsContext<Q>
) => Promise<GetStaticPropsResult<P>> | GetStaticPropsResult<P>

export type InferGetStaticPropsType<T> = T extends GetStaticProps<infer P, any>
  ? P
  : T extends (
      context?: GetStaticPropsContext<any>
    ) => Promise<GetStaticPropsResult<infer P>> | GetStaticPropsResult<infer P>
  ? P
  : never

export type GetStaticPathsContext = {
  locales?: string[]
  defaultLocale?: string
}

export type GetStaticPathsResult<P extends ParsedUrlQuery = ParsedUrlQuery> = {
  paths: Array<string | { params: P; locale?: string }>
  fallback: boolean | 'blocking'
}

export type GetStaticPaths<P extends ParsedUrlQuery = ParsedUrlQuery> = (
  context: GetStaticPathsContext
) => Promise<GetStaticPathsResult<P>> | GetStaticPathsResult<P>

export type GetServerSidePropsContext<
  Q extends ParsedUrlQuery = ParsedUrlQuery
> = {
  req: IncomingMessage & {
    cookies: NextApiRequestCookies
  }
  res: ServerResponse
  params?: Q
  query: ParsedUrlQuery
  preview?: boolean
  previewData?: PreviewData
  resolvedUrl: string
  locale?: string
  locales?: string[]
  defaultLocale?: string
}

export type GetServerSidePropsResult<P> =
  | { props: P }
  | { redirect: Redirect }
  | { notFound: true }

export type GetServerSideProps<
  P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery
> = (
  context: GetServerSidePropsContext<Q>
) => Promise<GetServerSidePropsResult<P>>

export type InferGetServerSidePropsType<T> = T extends GetServerSideProps<
  infer P,
  any
>
  ? P
  : T extends (
      context?: GetServerSidePropsContext<any>
    ) => Promise<GetServerSidePropsResult<infer P>>
  ? P
  : never

export type AsyncFunc = (...args: any) => Promise<any>

/**
 * Infer the type of the parameter from function that takes a single argument
 */
export type FirstParam<
  F extends (...args: any) => Promise<any>
> = Parameters<F>[0]

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
export type PromiseReturnType<T extends (...args: any) => Promise<any>> = Await<
  ReturnType<T>
>

export interface CancellablePromise<T> extends Promise<T> {
  cancel?: Function
}
