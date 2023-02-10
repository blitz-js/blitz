import { AuthClientPlugin } from "@blitzjs/auth"
import { setupBlitzClient } from "@blitzjs/next"
import { BlitzReactQueryPlugin } from "@blitzjs/rpc"
import { BlitzCustomPlugin } from "./custom-plugin/plugin"

export const { withBlitz } = setupBlitzClient({
  plugins: [
    AuthClientPlugin({
      cookiePrefix: "web-cookie-prefix",
    }),
    BlitzReactQueryPlugin({}),
    BlitzCustomPlugin({}),
  ],
})
