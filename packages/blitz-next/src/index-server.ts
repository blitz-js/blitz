import type {NextConfig} from "next"
import {
  GetServerSideProps,
  GetServerSidePropsResult,
  GetStaticProps,
  GetStaticPropsResult,
  NextApiRequest,
  NextApiResponse,
} from "next"
import type {
  AddParameters,
  AsyncFunc,
  BlitzServerPlugin,
  Ctx as BlitzCtx,
  FirstParam,
  RequestMiddleware,
  MiddlewareResponse,
} from "blitz"
import {handleRequestWithMiddleware, startWatcher, stopWatcher} from "blitz"
import {
  dehydrate,
  getInfiniteQueryKey,
  getQueryKey,
  installWebpackConfig,
  InstallWebpackConfigOptions,
  ResolverPathOptions,
} from "@blitzjs/rpc"
import {DefaultOptions, QueryClient} from "react-query"
import {IncomingMessage, ServerResponse} from "http"
import {withSuperJsonProps} from "./superjson"
import {ParsedUrlQuery} from "querystring"
import {PreviewData} from "next/types"

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

type SetupBlitzOptions = {
  plugins: BlitzServerPlugin<RequestMiddleware, Ctx>[]
  onError?: (err: Error) => void
}

export type BlitzGSSPHandler<
  TProps,
  Query extends ParsedUrlQuery = ParsedUrlQuery,
  PD extends PreviewData = PreviewData,
> = ({
  ctx,
  req,
  res,
  ...args
}: Parameters<GetServerSideProps<TProps, Query, PD>>[0] & {ctx: Ctx}) => ReturnType<
  GetServerSideProps<TProps, Query, PD>
>

export type BlitzGSPHandler<
  TProps,
  Query extends ParsedUrlQuery = ParsedUrlQuery,
  PD extends PreviewData = PreviewData,
> = ({
  ctx,
  ...args
}: Parameters<GetStaticProps<TProps, Query, PD>>[0] & {ctx: Ctx}) => ReturnType<
  GetStaticProps<TProps, Query, PD>
>

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

      const queryKey = infinite ? getInfiniteQueryKey(fn, input) : getQueryKey(fn, input)
      await queryClient.prefetchQuery(queryKey, () => fn(input, ctx))
    },
  }
}

export const setupBlitzServer = ({plugins, onError}: SetupBlitzOptions) => {
  const middlewares = plugins.flatMap((p) => p.requestMiddlewares)
  const contextMiddleware = plugins.flatMap((p) => p.contextMiddleware).filter(Boolean)

  const gSSP =
    <TProps, Query extends ParsedUrlQuery = ParsedUrlQuery, PD extends PreviewData = PreviewData>(
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
      ctx.prefetchInfiniteQuery = (...args) => prefetchQuery(...args, true)

      try {
        const result = await handler({req, res, ctx, ...rest})
        return withSuperJsonProps(withDehydratedState(result, getClient()))
      } catch (err: any) {
        onError?.(err)
        throw err
      }
    }

  const gSP =
    <TProps, Query extends ParsedUrlQuery = ParsedUrlQuery, PD extends PreviewData = PreviewData>(
      handler: BlitzGSPHandler<TProps, Query, PD>,
    ): GetStaticProps<TProps, Query, PD> =>
    async (context) => {
      const ctx = contextMiddleware.reduceRight((y, f) => (f ? f(y) : y), {} as Ctx)
      const {getClient, prefetchQuery} = prefetchQueryFactory(ctx)

      ctx.prefetchQuery = prefetchQuery
      ctx.prefetchInfiniteQuery = (...args) => prefetchQuery(...args, true)

      try {
        const result = await handler({...context, ctx: ctx})
        return withSuperJsonProps(withDehydratedState(result, getClient()))
      } catch (err: any) {
        onError?.(err)
        throw err
      }
    }

  const api =
    <TResult = Promise<void> | void>(
      handler: BlitzAPIHandler<TResult>,
    ): NextApiHandler<TResult | void> =>
    async (req, res) => {
      try {
        await handleRequestWithMiddleware(req, res, middlewares)
        return handler(req, res, res.blitzCtx)
      } catch (error: any) {
        onError?.(error)
        return res.status(400).send(error)
      }
    }

  return {gSSP, gSP, api}
}

export interface BlitzConfig extends NextConfig {
  blitz?: {
    resolverPath?: ResolverPathOptions
    customServer?: {
      hotReload?: boolean
    }
  }
}

export function withBlitz(nextConfig: BlitzConfig = {}) {
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
        },
      })
      if (typeof nextConfig.webpack === "function") {
        return nextConfig.webpack(config, options)
      }
      return config
    },
  })

  return config
}

export type PrefetchQueryFn = <T extends AsyncFunc, TInput = FirstParam<T>>(
  resolver: T,
  params: TInput,
  options?: DefaultOptions,
) => Promise<void>

type Result = Partial<GetServerSidePropsResult<any> & GetStaticPropsResult<any>>

function withDehydratedState<T extends Result>(result: T, queryClient: QueryClient | null) {
  if (!queryClient) {
    return result
  }
  const dehydratedState = dehydrate(queryClient)
  return {...result, props: {...("props" in result ? result.props : undefined), dehydratedState}}
}

declare module "blitz" {
  export interface Ctx {
    prefetchQuery: PrefetchQueryFn
    prefetchInfiniteQuery: PrefetchQueryFn
  }
}
