import {AuthClientPlugin} from "@blitzjs/auth"
import {setupClient} from "@blitzjs/next"

const {withBlitz} = setupClient({
  plugins: [
    AuthClientPlugin({
      cookiePrefix: "auth-tests-cookie-prefix",
    }),
  ],
})

export {withBlitz}
