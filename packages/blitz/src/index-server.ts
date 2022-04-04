import "./global"
import {IncomingMessage, ServerResponse} from "http"
import {Ctx} from "./types"

export * from "./index-browser"
export * from "./types"
export * from "./prisma-utils"
export * from "./middleware"
export * from "./paginate"

export interface MiddlewareResponse<C extends Ctx = Ctx> extends ServerResponse {
  blitzCtx: C
  blitzResult: unknown
}

export type MiddlewareNext = (error?: Error) => Promise<void> | void

export type Middleware<
  TRequest extends IncomingMessage = IncomingMessage,
  TResponse = ServerResponse,
> = {
  (req: TRequest, res: TResponse, next: MiddlewareNext): Promise<void> | void
  type?: string
  config?: Record<any, any>
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
