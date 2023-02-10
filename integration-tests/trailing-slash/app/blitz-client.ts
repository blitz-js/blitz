import {BlitzRpcPlugin} from "@blitzjs/rpc"
import {setupBlitzClient} from "@blitzjs/next"
import {AuthClientPlugin} from "@blitzjs/auth"

const {withBlitz} = setupBlitzClient({
  plugins: [
    AuthClientPlugin({
      cookiePrefix: "trailing-slash-tests-cookie-prefix",
    }),
    BlitzRpcPlugin({}),
  ],
})

export {withBlitz}
