import { AuthClientPlugin } from "@blitzjs/auth"
import { setupBlitzClient } from "@blitzjs/next"
import { BlitzRpcPlugin } from "@blitzjs/rpc"

export const { withBlitz, queryClient } = setupBlitzClient({
  plugins: [
    AuthClientPlugin({
      cookiePrefix: "__safeNameSlug__-cookie-prefix",
    }),
    BlitzRpcPlugin({}),
  ],
})
