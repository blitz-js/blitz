import { setupBlitzClient } from "@blitzjs/next"
import { BlitzRpcPlugin } from "@blitzjs/rpc"

export const { withBlitz } = setupBlitzClient({
  plugins: [BlitzRpcPlugin({})],
})
