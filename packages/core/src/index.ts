import {NextPage, NextComponentType, NextPageContext} from "next"
import {AppProps as NextAppProps} from "next/app"

export * from "./types"
export * from "./errors"
export {useQuery} from "./use-query"
export {usePaginatedQuery} from "./use-paginated-query"
export {useParam, useParams} from "./use-params"
export {useInfiniteQuery} from "./use-infinite-query"
export {ssrQuery} from "./ssr-query"
export {getIsomorphicRpcHandler, EnhancedResolverModule} from "./rpc" // new
export {withRouter} from "./with-router"
export {useRouter} from "./use-router"
export {useRouterQuery} from "./use-router-query"
export {passportAuth} from "./passport-adapter"
export {
  getAllMiddlewareForModule,
  handleRequestWithMiddleware,
  MiddlewareResponse,
  MiddlewareRequest,
  connectMiddleware,
} from "./middleware"
export {
  TOKEN_SEPARATOR,
  HANDLE_SEPARATOR,
  SESSION_TYPE_OPAQUE_TOKEN_SIMPLE,
  SESSION_TYPE_ANONYMOUS_JWT,
  SESSION_TOKEN_VERSION_0,
  COOKIE_ANONYMOUS_SESSION_TOKEN,
  COOKIE_SESSION_TOKEN,
  COOKIE_REFRESH_TOKEN,
  COOKIE_CSRF_TOKEN,
  COOKIE_PUBLIC_DATA_TOKEN,
  HEADER_CSRF,
  HEADER_PUBLIC_DATA_TOKEN,
  HEADER_SESSION_REVOKED,
  HEADER_CSRF_ERROR,
  LOCALSTORAGE_PREFIX,
  getAntiCSRFToken,
  getPublicDataToken,
  useSession,
  SessionConfig, // new
  PublicData,
  SessionContext,
} from "./supertokens"

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

export type BlitzComponentType<C = NextPageContext, IP = {}, P = {}> = NextComponentType<C, IP, P>

export interface AppProps<P = {}> extends NextAppProps<P> {
  Component: BlitzComponentType<NextPageContext, any, P> & {
    getLayout?: (component: JSX.Element) => JSX.Element
  }
}
export type BlitzPage<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (component: JSX.Element) => JSX.Element
}
export {isLocalhost} from "./utils/index"
