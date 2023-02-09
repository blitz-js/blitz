import {BlitzReactQueryPlugin} from "@blitzjs/rpc/react-query"
import {setupBlitzClient} from "@blitzjs/next"

const {withBlitz} = setupBlitzClient({
  plugins: [BlitzReactQueryPlugin({})],
})

export {withBlitz}
