import {BlitzReactQueryPlugin} from "@blitzjs/rpc/react-query"
import {setupBlitzClient} from "@blitzjs/next"
import {AuthClientPlugin} from "@blitzjs/auth"

const {withBlitz} = setupBlitzClient({
  plugins: [
    AuthClientPlugin({
      cookiePrefix: "trailing-slash-tests-cookie-prefix",
    }),
    BlitzReactQueryPlugin({}),
  ],
})

export {withBlitz}
