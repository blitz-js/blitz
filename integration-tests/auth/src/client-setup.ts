import {AuthClientPlugin} from "@blitzjs/auth"
import {setupClient} from "@blitzjs/next"

const {
  withBlitz,
  useSession,
  useAuthorize,
  useAuthorizeIf,
  useRedirectAuthenticated,
  useAuthenticatedSession,
} = setupClient({
  plugins: [
    AuthClientPlugin({
      cookiePrefix: "webapp-cookie-prefix",
    }),
  ],
})

export {
  withBlitz,
  useSession,
  useAuthorize,
  useAuthorizeIf,
  useRedirectAuthenticated,
  useAuthenticatedSession,
}
