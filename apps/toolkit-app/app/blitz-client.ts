import { AuthClientPlugin } from "@blitzjs/auth"
import { setupBlitzClient } from "@blitzjs/next"
import { BlitzRpcPlugin } from "@blitzjs/rpc"

const { withBlitz } = setupBlitzClient({
  plugins: [
    AuthClientPlugin({
      cookiePrefix: "web-cookie-prefix",
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

export { withBlitz }
