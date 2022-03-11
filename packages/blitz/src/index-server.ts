import "./global"
import {IncomingMessage, ServerResponse} from "http"
import {Ctx} from "./types"

export * from "./index-browser"
export * from "./types"
export * from "./prisma-utils"

export interface MiddlewareResponse<C extends Ctx = Ctx> extends ServerResponse {
  blitzCtx: C
  blitzResult: unknown
}

export type Middleware<
  TRequest extends IncomingMessage = IncomingMessage,
  TResponse = ServerResponse,
> = {
  (
    req: TRequest,
    res: TResponse,
    next: (error?: Error) => Promise<void> | void,
  ): Promise<void> | void
  type?: string
  config?: Record<any, any>
}

export const runMiddlewares = async <
  TReq extends IncomingMessage = IncomingMessage,
  TRes extends ServerResponse = MiddlewareResponse,
>(
  middlewares: Middleware[],
  req: TReq,
  res: TRes,
) => {
  const promises = middlewares.reduce((acc, middleware) => {
    const promise = new Promise(async (resolve, reject) => {
      await middleware(req, res, (result) =>
        result instanceof Error ? reject(result) : resolve(result),
      )
    })
    return [...acc, promise]
  }, [] as Promise<unknown>[])

  await Promise.all(promises)
}

export type BlitzServerPlugin<
  MiddlewareType = Middleware<any, any>,
  TCtx extends Ctx = Ctx,
  TExports extends object = {},
> = {
  middlewares: MiddlewareType[]
  contextMiddleware?: (ctx: TCtx) => TCtx
  exports?: TExports
}

export function createServerPlugin<
  TPluginOptions,
  TCtx,
  TPluginExports extends object,
  TMiddleware,
>(
  pluginConstructor: (
    options: TPluginOptions,
  ) => BlitzServerPlugin<TMiddleware, TCtx, TPluginExports>,
) {
  return pluginConstructor
}

export function createSetupServer<TMiddleware extends Middleware, TExports extends object>(
  setupServerConstructor: (plugins: BlitzServerPlugin<TMiddleware>) => TExports,
) {
  return setupServerConstructor
}
