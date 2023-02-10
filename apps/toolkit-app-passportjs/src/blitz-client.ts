import { AuthClientPlugin } from "@blitzjs/auth"
import { setupBlitzClient } from "@blitzjs/next"
import { BlitzReactQueryPlugin } from "@blitzjs/rpc"

export const { withBlitz } = setupBlitzClient({
  plugins: [
    AuthClientPlugin({
      cookiePrefix: "web-cookie-prefix",
    }),
    BlitzReactQueryPlugin({}),
  ],
})
