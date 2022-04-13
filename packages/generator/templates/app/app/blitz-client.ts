import { AuthClientPlugin } from "@blitzjs/auth"
import { setupClient } from "@blitzjs/next"
import { BlitzRpcPlugin } from "@blitzjs/rpc"

const { withBlitz } = setupClient({
  plugins: [
    AuthClientPlugin({
      cookiePrefix: "__safeNameSlug__-cookie-prefix",
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
