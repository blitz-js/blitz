import {BlitzReactQueryPlugin} from "@blitzjs/rpc"
import {setupBlitzClient} from "@blitzjs/next"

const {withBlitz} = setupBlitzClient({
  plugins: [BlitzReactQueryPlugin({})],
})

export {withBlitz}
