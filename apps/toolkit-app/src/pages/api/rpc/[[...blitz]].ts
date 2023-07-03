import { rpcHandler } from "@blitzjs/rpc"
import { api } from "src/blitz-server"

export default api(
  rpcHandler({
    onError: console.log,
    formatError: (error) => {
      error.message = `FormatError handler: ${error.message}`
      return error
    },
    // logging: {
    //   verbose: true,
    //   blockList: ["/getCurrentUser"],
    // },
  })
)
