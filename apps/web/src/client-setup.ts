import {setupClient} from "@blitzjs/next"
import {AuthClientPlugin} from "@blitzjs/auth"

const {withBlitz, useSession} = setupClient({
  plugins: [
    AuthClientPlugin({
      cookiePrefix: "webapp-cookie-prefix",
    }),
  ],
})

export {withBlitz, useSession}
