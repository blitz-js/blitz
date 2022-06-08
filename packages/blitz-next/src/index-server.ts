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
  Middleware,
  MiddlewareResponse,
} from "blitz"
import {handleRequestWithMiddleware, startWatcher, stopWatcher} from "blitz"
import {dehydrate, getQueryKey, getInfiniteQueryKey, loaderClient, loaderServer} from "@blitzjs/rpc"
import {DefaultOptions, QueryClient} from "react-query"
import {IncomingMessage, ServerResponse} from "http"
import {withSuperJsonProps} from "./superjson"
import {ResolverBasePath} from "@blitzjs/rpc/src/index-server"

export * from "./index-browser"

// Workaround for TS2742 "Inferred type cannot be named without a reference"
export interface Ctx extends BlitzCtx {}

export interface BlitzNextApiResponse
  extends MiddlewareResponse,
    Omit<NextApiResponse, keyof MiddlewareResponse> {}

export type NextApiHandler = (
  req: NextApiRequest,
  res: BlitzNextApiResponse,
) => void | Promise<void>

type SetupBlitzOptions = {
  plugins: BlitzServerPlugin<Middleware, Ctx>[]
}

export type BlitzGSSPHandler<TProps> = ({
  ctx,
  req,
  res,
  ...args
}: Parameters<GetServerSideProps<TProps>>[0] & {ctx: Ctx}) => ReturnType<GetServerSideProps<TProps>>

export type BlitzGSPHandler<TProps> = ({
  ctx,
  ...args
}: Parameters<GetStaticProps<TProps>>[0] & {ctx: Ctx}) => ReturnType<GetStaticProps<TProps>>

export type BlitzAPIHandler = (
  req: Parameters<NextApiHandler>[0],
  res: Parameters<NextApiHandler>[1],
  ctx: Ctx,
) => ReturnType<NextApiHandler>

export const setupBlitzServer = ({plugins}: SetupBlitzOptions) => {
  const middlewares = plugins.flatMap((p) => p.middlewares)
  const contextMiddleware = plugins.flatMap((p) => p.contextMiddleware).filter(Boolean)

  const gSSP =
    <TProps>(handler: BlitzGSSPHandler<TProps>): GetServerSideProps<TProps> =>
    async ({req, res, ...rest}) => {
      await handleRequestWithMiddleware<IncomingMessage, ServerResponse>(req, res, middlewares)
      const ctx = contextMiddleware.reduceRight(
        (y, f) => (f ? f(y) : y),
        (res as MiddlewareResponse).blitzCtx,
      )
      let queryClient: null | QueryClient = null

      const prefetchQuery: AddParameters<PrefetchQueryFn, [boolean?]> = async (
        fn,
        input,
        defaultOptions = {},
        infinite = false,
      ) => {
        queryClient = new QueryClient({defaultOptions})

        const queryKey = infinite ? getQueryKey(fn, input) : getInfiniteQueryKey(fn, input)
        await queryClient.prefetchQuery(queryKey, () => fn(input, ctx))
      }

      ctx.prefetchQuery = prefetchQuery
      ctx.prefetchInfiniteQuery = (...args) => prefetchQuery(...args, true)

      const result = await handler({req, res, ctx, ...rest})
      return withSuperJsonProps(withDehydratedState(result, queryClient))
    }

  const gSP =
    <TProps>(handler: BlitzGSPHandler<TProps>): GetStaticProps<TProps> =>
    async (context) => {
      const ctx = contextMiddleware.reduceRight((y, f) => (f ? f(y) : y), {} as Ctx)
      let queryClient: null | QueryClient = null

      const prefetchQuery: AddParameters<PrefetchQueryFn, [boolean?]> = async (
        fn,
        input,
        defaultOptions = {},
        infinite = false,
      ) => {
        queryClient = new QueryClient({defaultOptions})

        const queryKey = infinite ? getQueryKey(fn, input) : getInfiniteQueryKey(fn, input)
        await queryClient.prefetchQuery(queryKey, () => fn(input, ctx))
      }

      ctx.prefetchQuery = prefetchQuery
      ctx.prefetchInfiniteQuery = (...args) => prefetchQuery(...args, true)

      const result = await handler({...context, ctx: ctx})
      return withSuperJsonProps(withDehydratedState(result, queryClient))
    }

  const api =
    (handler: BlitzAPIHandler): NextApiHandler =>
    async (req, res) => {
      try {
        await handleRequestWithMiddleware(req, res, middlewares)
        return handler(req, res, res.blitzCtx)
      } catch (error) {
        return res.status(400).send(error)
      }
    }

  return {gSSP, gSP, api}
}

export interface BlitzConfig extends NextConfig {
  blitz?: {
    resolverBasePath?: ResolverBasePath
    customServer?: {
      hotReload?: boolean
    }
  }
}

interface WebpackRuleOptions {
  resolverBasePath?: ResolverBasePath
}

interface WebpackRule {
  test: RegExp
  use: Array<{
    loader: string
    options: WebpackRuleOptions
  }>
}

interface InstallWebpackConfigOptions {
  webpackConfig: {
    module: {
      rules: WebpackRule[]
    }
  }
  nextConfig: BlitzConfig
}

export function installWebpackConfig({webpackConfig, nextConfig}: InstallWebpackConfigOptions) {
  const options: WebpackRuleOptions = {
    resolverBasePath: nextConfig.blitz?.resolverBasePath,
  }

  webpackConfig.module.rules.push({
    test: /\/\[\[\.\.\.blitz]]\.[jt]s$/,
    use: [
      {
        loader: loaderServer,
        options,
      },
    ],
  })
  webpackConfig.module.rules.push({
    test: /[\\/](queries|mutations)[\\/]/,
    use: [
      {
        loader: loaderClient,
        options,
      },
    ],
  })
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
      installWebpackConfig({webpackConfig: config, nextConfig})
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
  const dehydratedProps = dehydrate(queryClient)
  return {...result, props: {...("props" in result ? result.props : undefined), dehydratedProps}}
}

declare module "blitz" {
  export interface Ctx {
    prefetchQuery: PrefetchQueryFn
    prefetchInfiniteQuery: PrefetchQueryFn
  }
}
