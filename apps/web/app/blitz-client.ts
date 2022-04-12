import {AuthClientPlugin} from "@blitzjs/auth"
import {setupClient} from "@blitzjs/next"

const {withBlitz} = setupClient({
  plugins: [
    AuthClientPlugin({
      cookiePrefix: "webapp-cookie-prefix",
    }),
  ],
})

export {withBlitz}
