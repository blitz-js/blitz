import {BlitzRpcPlugin} from "@blitzjs/rpc"
import {setupBlitzClient} from "@blitzjs/next"

const {withBlitz} = setupBlitzClient({
  plugins: [BlitzRpcPlugin({})],
})

export {withBlitz}
