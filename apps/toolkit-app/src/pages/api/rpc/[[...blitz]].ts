import { rpcHandler } from "@blitzjs/rpc"
import { api } from "src/blitz-server"

class ErrorWithStatusCode extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

export default api(
  rpcHandler({
    onError: console.log,
    formatError: (error) => {
      return new ErrorWithStatusCode("RPC Handler formatted error: " + error.message, 420)
    },
  })
)
