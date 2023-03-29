import {createServerPlugin} from "blitz"
import {invoke} from "../client/invoke"

export const RpcServerPlugin = createServerPlugin(() => {
  return {
    requestMiddlewares: [],
    exports: () => ({
      invoke,
    }),
  }
})
