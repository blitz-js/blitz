import type {
  GetServerSideProps,
  GetServerSidePropsResult,
  GetStaticProps,
  GetStaticPropsResult,
  NextApiRequest,
  NextApiResponse,
  NextConfig,
} from "next"
import {
  AddParameters,
  AsyncFunc,
  BlitzLogger,
  BlitzServerPlugin,
  Ctx as BlitzCtx,
  FirstParam,
  handleRequestWithMiddleware,
  initializeLogger,
  isRouteUrlObject,
  MiddlewareResponse,
  reduceBlitzServerPlugins,
  RouteUrlObject,
  startWatcher,
  stopWatcher,
} from "blitz"
import {
  DefaultOptions,
  dehydrate,
  getInfiniteQueryKey,
  getQueryKey,
  installWebpackConfig,
  InstallWebpackConfigOptions,
  QueryClient,
  ResolverPathOptions,
} from "@blitzjs/rpc"
import {IncomingMessage, ServerResponse} from "http"
import {withSuperJsonProps} from "./superjson"
import {ParsedUrlQuery} from "querystring"
import {PreviewData} from "next/types"
import {resolveHref} from "next/dist/client/resolve-href"

export * from "./index-browser"

// Workaround for TS2742 "Inferred type cannot be named without a reference"
export interface Ctx extends BlitzCtx {}

export interface BlitzNextApiResponse
  extends MiddlewareResponse,
    Omit<NextApiResponse, keyof MiddlewareResponse> {}

export type NextApiHandler<TResult> = (
  req: NextApiRequest,
  res: BlitzNextApiResponse,
) => TResult | void | Promise<TResult | void>

export type Redirect =
  | {
      statusCode: 301 | 302 | 303 | 307 | 308
      destination: string | RouteUrlObject
      basePath?: false
    }
  | {
      permanent: boolean
      destination: string | RouteUrlObject
      basePath?: false
    }

export type BlitzGSSPResult<P> = {props: P | Promise<P>} | {redirect: Redirect} | {notFound: true}

export type BlitzGSPResult<P> =
  | {props: P; revalidate?: number | boolean}
  | {redirect: Redirect; revalidate?: number | boolean}
  | {notFound: true; revalidate?: number | boolean}

export type BlitzGSSPHandler<
  TProps extends {[key: string]: any} = {[key: string]: any},
  Query extends ParsedUrlQuery = ParsedUrlQuery,
  PD extends PreviewData = PreviewData,
> = ({
  ctx,
  req,
  res,
  ...args
}: Parameters<GetServerSideProps<TProps, Query, PD>>[0] & {ctx: Ctx}) => Promise<
  BlitzGSSPResult<TProps>
>

export type BlitzGSPHandler<
  TProps extends {[key: string]: any} = {[key: string]: any},
  Query extends ParsedUrlQuery = ParsedUrlQuery,
  PD extends PreviewData = PreviewData,
> = ({
  ctx,
  ...args
}: Parameters<GetStaticProps<TProps, Query, PD>>[0] & {ctx: Ctx}) =>
  | Promise<BlitzGSPResult<TProps>>
  | BlitzGSPResult<TProps>

export type BlitzAPIHandler<TResult> = (
  req: NextApiRequest,
  res: BlitzNextApiResponse,
  ctx: Ctx,
) => TResult | void | Promise<TResult | void>

const prefetchQueryFactory = (
  ctx: BlitzCtx,
): {
  getClient: () => QueryClient | null
  prefetchQuery: AddParameters<PrefetchQueryFn, [boolean?]>
} => {
  let queryClient: null | QueryClient = null

  return {
    getClient: () => queryClient,
    prefetchQuery: async (fn, input, defaultOptions = {}, infinite = false) => {
      if (!queryClient) {
        queryClient = new QueryClient({defaultOptions})
      }

      if (infinite) {
        await queryClient.prefetchInfiniteQuery(getInfiniteQueryKey(fn, input), () =>
          fn(input, ctx),
        )
      } else {
        await queryClient.prefetchQuery(getQueryKey(fn, input), () => fn(input, ctx))
      }
    },
  }
}

export const setupBlitzServer = <TPlugins extends readonly BlitzServerPlugin<object>[]>({
  plugins,
  onError,
  logger,
  formatError,
}: {
  plugins: TPlugins
  onError?: (err: Error) => void
  logger?: ReturnType<typeof BlitzLogger>
  formatError?: (err: Error) => Error
}) => {
  initializeLogger(logger ?? BlitzLogger())

  const {middlewares, contextMiddleware, pluginExports} = reduceBlitzServerPlugins({plugins})

  const gSSP =
    <
      TProps extends {[key: string]: any} = {[key: string]: any},
      Query extends ParsedUrlQuery = ParsedUrlQuery,
      PD extends PreviewData = PreviewData,
    >(
      handler: BlitzGSSPHandler<TProps, Query, PD>,
    ): GetServerSideProps<TProps, Query, PD> =>
    async ({req, res, ...rest}) => {
      await handleRequestWithMiddleware<IncomingMessage, ServerResponse>(req, res, middlewares)
      const ctx = contextMiddleware.reduceRight(
        (y, f) => (f ? f(y) : y),
        (res as MiddlewareResponse).blitzCtx,
      )

      const {getClient, prefetchQuery} = prefetchQueryFactory(ctx)

      ctx.prefetchQuery = prefetchQuery
      ctx.prefetchInfiniteQuery = (fn, input, defaultOptions = {}) =>
        prefetchQuery(fn, input, defaultOptions, true)

      try {
        const result = await handler({req, res, ctx, ...rest})
        return withSuperJsonProps(
          withDehydratedState(
            normalizeRedirectValues<GetServerSidePropsResult<TProps>>(result),
            getClient(),
          ),
        )
      } catch (error: any) {
        onError?.(error)
        throw formatError?.(error) ?? error
      }
    }

  const gSP =
    <
      TProps extends {[key: string]: any} = {[key: string]: any},
      Query extends ParsedUrlQuery = ParsedUrlQuery,
      PD extends PreviewData = PreviewData,
    >(
      handler: BlitzGSPHandler<TProps, Query, PD>,
    ): GetStaticProps<TProps, Query, PD> =>
    async (context) => {
      const ctx = contextMiddleware.reduceRight((y, f) => (f ? f(y) : y), {} as Ctx)
      const {getClient, prefetchQuery} = prefetchQueryFactory(ctx)

      ctx.prefetchQuery = prefetchQuery
      ctx.prefetchInfiniteQuery = (...args) => prefetchQuery(...args, true)

      try {
        const result = await handler({...context, ctx: ctx})
        return withSuperJsonProps(
          withDehydratedState(
            normalizeRedirectValues<GetStaticPropsResult<TProps>>(result),
            getClient(),
          ),
        )
      } catch (error: any) {
        onError?.(error)
        throw formatError?.(error) ?? error
      }
    }

  const api =
    <TResult = Promise<void> | void>(
      handler: BlitzAPIHandler<TResult>,
    ): NextApiHandler<TResult | void> =>
    async (req, res) => {
      try {
        return await handleRequestWithMiddleware(req, res, [
          ...middlewares,
          (req, res) => handler(req, res, res.blitzCtx),
        ])
      } catch (error: any) {
        onError?.(error)
        const formattedError = formatError?.(error) ?? error
        return res.status(400).send(formattedError)
      }
    }

  return {gSSP, gSP, api, ...pluginExports}
}

export interface BlitzConfig extends NextConfig {
  blitz?: {
    resolverPath?: ResolverPathOptions
    resolversDynamicImport?: boolean
    includeRPCFolders?: string[]
    customServer?: {
      hotReload?: boolean
    }
  }
}

export function withBlitz(nextConfig: BlitzConfig = {}): NextConfig {
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.NODE_ENV !== "test" &&
    process.env.MODE !== "test"
  ) {
    void startWatcher()

    process.on("SIGINT", () => {
      void stopWatcher()
      process.exit(0)
    })

    process.on("exit", function () {
      void stopWatcher()
    })
  }

  const config = Object.assign({}, nextConfig, {
    webpack: (config: InstallWebpackConfigOptions["webpackConfig"], options: any) => {
      installWebpackConfig({
        webpackConfig: config,
        webpackRuleOptions: {
          resolverPath: nextConfig.blitz?.resolverPath,
          resolversDynamicImport:
            nextConfig.blitz?.resolversDynamicImport ?? Boolean(process.env.VERCEL),
          includeRPCFolders: nextConfig.blitz?.includeRPCFolders,
        },
      })

      if (typeof nextConfig.webpack === "function") {
        return nextConfig.webpack(config, options)
      }
      return config
    },
  })

  const {blitz, ...rest} = config
  return rest
}

export type PrefetchQueryFn = <T extends AsyncFunc, TInput = FirstParam<T>>(
  resolver: T,
  params: TInput,
  options?: DefaultOptions,
) => Promise<void>

type BlitzResult = Partial<BlitzGSPResult<any> & BlitzGSSPResult<any>>
type Result = Partial<GetServerSidePropsResult<any> & GetStaticPropsResult<any>>

function withDehydratedState<T extends Result>(result: T, queryClient: QueryClient | null) {
  if (!queryClient) {
    return result
  }
  const dehydratedState = dehydrate(queryClient)
  return {...result, props: {...("props" in result ? result.props : undefined), dehydratedState}}
}

// Converts Blitz's GetServerSidePropsResult and GetStaticPropsResult to a NextJS compatible format
// Blitz accepts string | RouteUrlObject as redirect.destination — this function converts it to a string
const normalizeRedirectValues = <NormalizedResult extends Result>(
  result: BlitzResult,
): NormalizedResult => {
  if ("redirect" in result) {
    const dest = result.redirect?.destination
    if (dest && isRouteUrlObject(dest)) {
      // Todo: find a better way to resolve href without `as any` assertion.
      const resolvedDest = resolveHref({asPath: "/", pathname: "/"} as any, dest, true)

      return {
        ...result,
        redirect: {...result.redirect, destination: resolvedDest[1] || resolvedDest[0]},
      } as NormalizedResult
    }
  }

  return result as NormalizedResult
}

declare module "blitz" {
  export interface Ctx {
    prefetchQuery: PrefetchQueryFn
    prefetchInfiniteQuery: PrefetchQueryFn
  }
}
