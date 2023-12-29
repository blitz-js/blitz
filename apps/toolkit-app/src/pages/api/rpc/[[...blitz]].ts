import { rpcHandler } from "@blitzjs/rpc"
import { api } from "src/blitz-server"

export default api(
  rpcHandler({
    onError: (error, ctx) => console.log(error),
    formatError: (error, ctx) => {
      error.message = `FormatError handler: ${error.message}`
      return error
    },
    // logging: {
    //   verbose: true,
    //   blockList: ["/getCurrentUser"],
    // },
  })
)
