import {BlitzReactQueryPlugin} from "@blitzjs/rpc/react-query"
import {setupBlitzClient} from "@blitzjs/next"
import {AuthClientPlugin} from "@blitzjs/auth"

const {withBlitz} = setupBlitzClient({
  plugins: [
    AuthClientPlugin({
      cookiePrefix: "no-suspense-tests-cookie-prefix",
    }),
    BlitzReactQueryPlugin({}),
  ],
})

export {withBlitz}
