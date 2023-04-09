import { rpcHandler } from "@blitzjs/rpc"
import { api } from "src/blitz-server"

export default api(
  rpcHandler({
    onError: console.log,
    formatError: (error) => {
      return new Error("RPC Handler formatted error: " + error.message)
    },
  })
)
