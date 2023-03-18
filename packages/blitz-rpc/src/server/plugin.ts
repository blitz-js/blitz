import {createServerPlugin} from "blitz"
import {invokeResolver} from "../client/invoke"

export const RpcServerPlugin = createServerPlugin(() => {
  return {
    requestMiddlewares: [],
    exports: () => ({
      invokeResolver,
    }),
  }
})
