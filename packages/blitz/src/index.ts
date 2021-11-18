/*
 * IF YOU CHANGE THE BELOW EXPORTS
 *    You also need to update the rewrite map in
 *    packages/babel-preset/src/rewrite-imports.ts
 */
export {default as Image} from "next/image"
export type {ImageProps, ImageLoader, ImageLoaderProps} from "next/image"

export * from "next/link"
export * from "next/app"
export * from "next/config"
export * from "next/dynamic"
export * from "next/head"
export {ErrorComponent} from "next/error"
export type {ErrorProps} from "next/error"

export {Document, DocumentHead, Html, Main, BlitzScript} from "next/document"
export type {DocumentProps, DocumentContext, DocumentInitialProps} from "next/document"

export {Script} from "next/script"
export type {Props as ScriptProps} from "next/script"

export * from "next/stdlib"
export * from "next/stdlib-server"
export * from "next/data-client"

export type {
  BlitzConfig,
  NextPageContext,
  BlitzPageContext,
  NextComponentType,
  BlitzComponentType,
  NextApiResponse,
  BlitzApiResponse,
  NextApiRequest,
  BlitzApiRequest,
  NextApiHandler,
  BlitzApiHandler,
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
  Redirect,
  NextPage,
  BlitzPage,
  BlitzLayout,
  AppProps,
  PageConfig,
  PreviewData,
  GetStaticPropsContext,
  GetStaticPropsResult,
  GetStaticProps,
  InferGetStaticPropsType,
  GetStaticPathsContext,
  GetStaticPathsResult,
  GetStaticPaths,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  GetServerSideProps,
  InferGetServerSidePropsType,
  RedirectAuthenticatedTo,
  RedirectAuthenticatedToFnCtx,
  RedirectAuthenticatedToFn,
  RouteUrlObject,
} from "next/types"
export type {PromiseReturnType} from "next/types/utils"
