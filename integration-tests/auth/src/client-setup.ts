import {AuthClientPlugin} from "@blitzjs/auth"
import {setupClient} from "@blitzjs/next"

export const {withBlitz} = setupClient({
  plugins: [
    AuthClientPlugin({
      cookiePrefix: "webapp-cookie-prefix",
    }),
  ],
})
