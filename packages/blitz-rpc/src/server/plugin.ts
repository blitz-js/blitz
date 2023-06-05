import {RequestMiddleware, createServerPlugin} from "blitz"
import {invoke} from "../client/invoke"

export const RpcServerPlugin = createServerPlugin(() => {
  return {
    requestMiddlewares: [] as RequestMiddleware<any, any, void | Promise<void>>[],
    exports: () => ({
      invoke,
    }),
  }
})
