import "./global"
import {IncomingMessage, ServerResponse} from "http"
import {Ctx} from "./types"

export * from "./index-browser"
export * from "./types"
export * from "./utils/run-prisma"
export * from "./middleware"
export * from "./paginate"
export {baseLogger, newLine, log} from "./logging"
export {startWatcher, stopWatcher} from "./cli/utils/routes-manifest"

export interface MiddlewareResponse<C extends Ctx = Ctx> extends ServerResponse {
  blitzCtx: C
  blitzResult: unknown
}

export type MiddlewareNext = (error?: Error) => Promise<void> | void

export type RequestMiddleware<
  TRequest extends IncomingMessage = IncomingMessage,
  TResponse = ServerResponse,
  TResult = Promise<void> | void,
> = {
  (req: TRequest, res: TResponse, next: MiddlewareNext): TResult
  type?: string
  config?: Record<any, any>
}

export type BlitzServerPlugin<
  RequestMiddlewareType = RequestMiddleware<any, any>,
  TCtx extends Ctx = Ctx,
  TExports extends object = {},
> = {
  requestMiddlewares: RequestMiddlewareType[]
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

export function createSetupServer<TMiddleware extends RequestMiddleware, TExports extends object>(
  setupServerConstructor: (plugins: BlitzServerPlugin<TMiddleware>) => TExports,
) {
  return setupServerConstructor
}

export const BlitzServerMiddleware = <
  TMiddleware extends RequestMiddleware<any, any> = RequestMiddleware,
>(
  middleware: TMiddleware,
): BlitzServerPlugin => ({
  requestMiddlewares: [middleware],
})
