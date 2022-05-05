import {getCookieParser} from "@blitzjs/auth"
import type {BlitzServerPlugin, Middleware, Ctx} from "blitz"
import {IncomingMessage, ServerResponse} from "http"
import {QueryClient} from "react-query"
import {dehydrate, getQueryKey} from "./data-client"

// store prefetchQueryClient on ctx

// todo: move it somewhere because it's used in both server rpc and auth plugins
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

export async function setQueryClient(req: IncomingMessage, res: ServerResponse): Promise<void> {
  ensureApiRequest(req)
  ensureMiddlewareResponse(res)
  // todo: make it possible to pass query client options? in plugin server setup
  const queryClient = new QueryClient({})

  // todo: types
  res.blitzCtx.prefetchBlitzQuery = async (fn: any, input: any) => {
    const queryKey = getQueryKey(fn, input)
    await queryClient.prefetchQuery(queryKey, () =>
      // todo: should use invokeWithMiddleware(fn, input, ctx)
      fn(input, res.blitzCtx),
    )

    return {
      dehydratedState: dehydrate(queryClient),
    }
  }
}

interface RpcServerPluginOptions {}
export function RpcServerPlugin(_options: RpcServerPluginOptions): BlitzServerPlugin<any, any> {
  function rpcPluginQueryClientMiddleware(): Middleware<
    IncomingMessage,
    ServerResponse & {blitzCtx: Ctx}
  > {
    return async (req, res, next) => {
      if (!res.blitzCtx?.prefetchBlitzQuery) {
        await setQueryClient(req, res)
      }
      return next()
    }
  }
  return {
    middlewares: [rpcPluginQueryClientMiddleware()],
  }
}

declare module "blitz" {
  export interface Ctx {
    // todo: types
    prefetchBlitzQuery: (...args: any) => Promise<{dehydratedState: any}>
  }
}
