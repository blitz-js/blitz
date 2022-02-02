import { setupClient } from "@blitzjs/next"
import { AuthClientPlugin } from "@blitzjs/auth/dist/index-browser"

const { withBlitz, useSession } = setupClient({
  plugins: [AuthClientPlugin({})]
})

export { withBlitz, useSession }
