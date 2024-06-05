// Note: This stays in the /pages folder for the time being

import { rpcHandler } from "@blitzjs/rpc"
import { api } from "src/app/blitz-server"

const getBlitzLogLevel = (): "info" | "debug" | undefined => {
  const requestedLevel = process.env.BLITZ_LOG_DISABLE_LEVEL
  if (requestedLevel === "info" || requestedLevel === "debug") {
    return requestedLevel
  }
  return undefined
}

export default api(
  rpcHandler({
    onError: (error, ctx) => console.log(error),
    logging: {
      disablelevel: getBlitzLogLevel(),
    },
  })
)
