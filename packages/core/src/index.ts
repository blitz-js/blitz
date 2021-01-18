import {NextComponentType, NextPage, NextPageContext} from "next"
import {AppProps as NextAppProps} from "next/app"

export * from "./types"
export * from "./errors"
export * from "./constants"
export {BlitzScript} from "./blitz-script"
export {useQuery, usePaginatedQuery, useInfiniteQuery} from "./use-query-hooks"
export {getQueryKey, invalidateQuery, setQueryData} from "./utils/react-query-utils"
export {useParam, useParams} from "./use-params"
export {withRouter, RouterContext, BlitzRouter} from "./with-router"
export {useRouter} from "./use-router"
export {useRouterQuery} from "./use-router-query"
export {passportAuth} from "./passport-adapter"
export {getIsomorphicEnhancedResolver} from "./rpc"
export {useMutation} from "./use-mutation"
export {invoke, invokeWithMiddleware} from "./invoke"

export {
  getAllMiddlewareForModule,
  handleRequestWithMiddleware,
  connectMiddleware,
  Ctx,
  DefaultCtx,
} from "./middleware"
export {
  getAntiCSRFToken,
  useSession,
  SessionConfig, // new
  SessionContext,
  AuthenticatedSessionContext,
} from "./supertokens"

export {SecurePassword, hash256, generateToken} from "./auth-utils"

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

export {default as Link, LinkProps} from "next/link"

export {default as Router} from "next/router"

export {default as Image, ImageProps} from "next/image"

export {
  default as Document,
  Html,
  Head as DocumentHead,
  Main,
  DocumentContext,
  DocumentInitialProps,
} from "next/document"

export {default as dynamic} from "next/dynamic"

export {default as ErrorComponent, ErrorProps} from "next/error"

export {default as getConfig} from "next/config"

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
export {prettyMs} from "./utils/pretty-ms"

export {makeServerOnlyPrisma} from "./prisma-utils"
