import {AuthClientPlugin} from "@blitzjs/auth"
import {setupBlitzClient} from "@blitzjs/next"
import {BlitzRpcPlugin} from "@blitzjs/rpc"

const {withBlitz, queryClient} = setupBlitzClient({
  plugins: [
    AuthClientPlugin({
      cookiePrefix: "webapp-cookie-prefix",
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

export {withBlitz, queryClient}
