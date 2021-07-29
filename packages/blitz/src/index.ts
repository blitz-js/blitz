export * from "@blitzjs/core/app"
export * from "@blitzjs/core/config"
export * from "@blitzjs/core/document"
export * from "@blitzjs/core/dynamic"
export * from "@blitzjs/core/head"
export * from "@blitzjs/core"
export * from "@blitzjs/core/server"

/*
 * IF YOU CHANGE THE BELOW EXPORTS
 *    You also need to update the rewrite map in
 *    packages/babel-preset/src/rewrite-imports.ts
 */
export {default as Image} from "next/image"
export type {ImageProps, ImageLoader, ImageLoaderProps} from "next/image"
export {Script} from "next/script"
export type {Props as ScriptProps} from "next/script"
export * from "next/stdlib"
export * from "next/stdlib-server"
export * from "next/data-client"

// TODO rename types
export type {
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
  Redirect,
  NextPage,
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
} from "next/types"
