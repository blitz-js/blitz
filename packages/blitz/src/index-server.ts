import "./global"
import {IncomingMessage, ServerResponse} from "http"
import {Ctx} from "./types"
// import {findBlitzConfigDirectory} from "./cli/utils/routes-manifest"
// import {readFileSync} from "fs-extra"

export * from "./index-browser"
export * from "./types"
export * from "./prisma-utils"
export * from "./run-prisma"
export * from "./middleware"
export * from "./paginate"
export {baseLogger, newLine, log} from "./logging"
export {startWatcher, stopWatcher} from "./cli/utils/routes-manifest"
// const blitzConfig = findBlitzConfigDirectory() as string
// const file = readFileSync(blitzConfig)
// export const Routes = eval(file.toString())

export interface MiddlewareResponse<C extends Ctx = Ctx> extends ServerResponse {
  blitzCtx: C
  blitzResult: unknown
}

export type MiddlewareNext = (error?: Error) => Promise<void> | void

export type RequestMiddleware<
  TRequest extends IncomingMessage = IncomingMessage,
  TResponse = ServerResponse,
> = {
  (req: TRequest, res: TResponse, next: MiddlewareNext): Promise<void> | void
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
