import { setupBlitzServer } from "@blitzjs/next"
import { AuthServerPlugin, PrismaStorage } from "@blitzjs/auth"
import db from "db"
import { simpleRolesIsAuthorized } from "@blitzjs/auth"
import type { BlitzServerConfig } from "blitz"

const { gSSP, gSP, api } = setupBlitzServer({
  plugins: [
    AuthServerPlugin({
      cookiePrefix: "web-cookie-prefix",
      storage: PrismaStorage(db),
      isAuthorized: simpleRolesIsAuthorized,
    }),
  ],
})

const config: BlitzServerConfig = {
  customTemplates: "app/templates",
}

export { gSSP, gSP, api }

export default config
