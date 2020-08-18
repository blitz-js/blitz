import {NextPage, NextComponentType} from "next"
import {AppProps as NextAppProps} from "next/app"

export * from "./use-query"
export * from "./use-paginated-query"
export * from "./use-params"
export * from "./use-infinite-query"
export * from "./ssr-query"
export * from "./rpc"
export * from "./with-router"
export * from "./use-router"
export * from "./use-router-query"
export * from "./middleware"
export * from "./types"
export * from "./supertokens"
export * from "./passport-adapter"
export * from "./errors"

// --------------------
// Exports from Next.js
// --------------------
export {
  GetStaticProps,
  GetStaticPaths,
  GetServerSideProps,
  InferGetStaticPropsType,
  InferGetServerSidePropsType,
  NextApiRequest as BlitzApiRequest,
  NextApiResponse as BlitzApiResponse,
} from "next"

export {default as Head} from "next/head"

export {default as Link} from "next/link"

export {default as Router} from "next/router"

export {
  default as Document,
  Html,
  Head as DocumentHead,
  Main,
  NextScript as BlitzScript,
  DocumentContext,
  DocumentInitialProps,
} from "next/document"

export {default as dynamic} from "next/dynamic"

export {default as ErrorComponent} from "next/error"

export type BlitzComponentType = NextComponentType

export interface AppProps extends NextAppProps {
  Component: BlitzComponentType & {
    getLayout?: (component: JSX.Element) => JSX.Element
  }
}
export type BlitzPage<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (component: JSX.Element) => JSX.Element
}
export {isLocalhost} from "./utils/index"
