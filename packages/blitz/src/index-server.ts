import {Ctx} from "./types"

export * from "./index-browser"
export * from "./types"

export type Middleware<TRequest, TResponse, TNext> = {
  (req: TRequest, res: TResponse, next: TNext): Promise<void> | void
  type?: string
  config?: Record<any, any>
}

export type BlitzServerPlugin<
  MiddlewareType = Middleware<any, any, any>,
  TCtx extends Ctx = Ctx,
  TExports extends object = {},
> = {
  middlewares: MiddlewareType[]
  contextMiddleware?: (ctx: TCtx) => TCtx
  exports: TExports
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
