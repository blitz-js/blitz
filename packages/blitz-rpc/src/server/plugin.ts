import {
  type FirstParam,
  type PromiseReturnType,
  type RequestMiddleware,
  createServerPlugin,
} from "blitz"
import {invoke} from "./invoke"

export type RpcLoggerOptions = {
  /**
   * allowList Represents the list of routes for which logging should be enabled
   * If allowList is defined then only those routes will be logged
   */
  allowList?: string[]
  /**
   * blockList Represents the list of routes for which logging should be disabled
   * If blockList is defined then all routes except those will be logged
   */
  blockList?: string[]
  /**
   * verbose Represents the flag to enable/disable logging
   * If verbose is true then Blitz RPC will log the input and output of each resolver
   */
  verbose?: boolean
  /**
   * disablelevel Represents the flag to enable/disable logging for a particular level
   */
  disablelevel?: "debug" | "info"
}

type RpcPluginOptions = {
  logging?: RpcLoggerOptions
  onInvokeError?: (error: unknown) => void
}

export const RpcServerPlugin = createServerPlugin((options: RpcPluginOptions) => {
  if (options.logging) {
    globalThis.blitzRpcRpcLoggerOptions = options.logging
  }
  async function invokeWithCtx<T extends (...args: any) => any, TInput = FirstParam<T>>(
    queryFn: T,
    params: TInput,
  ): Promise<PromiseReturnType<T>> {
    const ctx = await globalThis.__BLITZ_GET_RSC_CONTEXT()
    try {
      return await invoke(queryFn, params, ctx, options.logging)
    } catch (error) {
      if (options.onInvokeError) {
        options.onInvokeError(error)
      }
      throw error
    }
  }
  return {
    requestMiddlewares: [] as RequestMiddleware<any, any, void | Promise<void>>[],
    exports: () => ({
      invoke: invokeWithCtx,
    }),
  }
})
