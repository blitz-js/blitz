import {AuthClientPlugin} from "@blitzjs/auth"
import {setupBlitzClient} from "@blitzjs/next"

const {withBlitz} = setupBlitzClient({
  plugins: [
    AuthClientPlugin({
      cookiePrefix: "auth-tests-cookie-prefix",
    }),
  ],
})

export {withBlitz}
