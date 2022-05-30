import {BlitzRpcPlugin} from "@blitzjs/rpc"
import {setupBlitzClient} from "@blitzjs/next"
import {AuthClientPlugin} from "@blitzjs/auth"

const {withBlitz} = setupBlitzClient({
  plugins: [
    AuthClientPlugin({
      cookiePrefix: "no-suspense-tests-cookie-prefix",
    }),
    BlitzRpcPlugin({
      reactQueryOptions: {
        queries: {
          staleTime: 7000,
        },
      },
    }),
  ],
})

export {withBlitz}
