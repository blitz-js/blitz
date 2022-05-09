import {getCookieParser} from "@blitzjs/auth"
import type {BlitzServerPlugin, Middleware, Ctx, AsyncFunc, FirstParam} from "blitz"
import {IncomingMessage, ServerResponse} from "http"
import {DefaultOptions, QueryClient} from "react-query"
import {DehydratedState} from "react-query/types/hydration"
import {dehydrate, getQueryKey} from "./data-client"

function ensureApiRequest(
  req: IncomingMessage & {[key: string]: any},
): asserts req is IncomingMessage & {cookies: {[key: string]: string}} {
  if (!("cookies" in req)) {
    // Cookie parser isn't include inside getServerSideProps, so we have to add it
    req.cookies = getCookieParser(req.headers)()
  }
}
function ensureMiddlewareResponse(
  res: ServerResponse & {[key: string]: any},
): asserts res is ServerResponse & {blitzCtx: Ctx} {
  if (!("blitzCtx" in res)) {
    res.blitzCtx = {} as Ctx
  }
}

export async function setQueryClient(
  req: IncomingMessage,
  res: ServerResponse,
  defaultOptions: DefaultOptions = {},
): Promise<void> {
  ensureApiRequest(req)
  ensureMiddlewareResponse(res)

  res.blitzCtx.prefetchBlitzQuery = async (fn, input, options = {}) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          ...defaultOptions.mutations,
          ...options.mutations,
        },
        queries: {
          ...defaultOptions.queries,
          ...options.queries,
        },
      },
    })

    const queryKey = getQueryKey(fn, input)
    await queryClient.prefetchQuery(queryKey, () => fn(input, res.blitzCtx))

    return {
      dehydratedState: dehydrate(queryClient),
    }
  }
}

export interface RpcServerPluginOptions {
  prefetchQueryOptions?: DefaultOptions
}

export function RpcServerPlugin(options: RpcServerPluginOptions): BlitzServerPlugin<any, any> {
  function rpcPluginQueryClientMiddleware(): Middleware<
    IncomingMessage,
    ServerResponse & {blitzCtx: Ctx}
  > {
    return async (req, res, next) => {
      if (!res.blitzCtx?.prefetchBlitzQuery) {
        await setQueryClient(req, res, options.prefetchQueryOptions)
      }
      return next()
    }
  }
  return {
    middlewares: [rpcPluginQueryClientMiddleware()],
  }
}

type PrefetchQueryFn = <T extends AsyncFunc, TInput = FirstParam<T>>(
  resolver: T,
  params: TInput,
  options?: DefaultOptions,
) => Promise<{dehydratedState: DehydratedState}>

declare module "blitz" {
  export interface Ctx {
    prefetchBlitzQuery: PrefetchQueryFn
  }
}

export type {DehydratedState}
