import { setupBlitz } from "@blitzjs/next"
import { AuthServerPlugin, PrismaStorage } from "@blitzjs/auth"
import { prisma as db } from "../db/index"
import { simpleRolesIsAuthorized } from "@blitzjs/auth"

const { gSSP, gSP, api } = setupBlitz({
  plugins: [
    AuthServerPlugin({
      cookiePrefix: "__safeNameSlug__-cookie-prefix",
      // TODO fix type
      storage: PrismaStorage(db as any),
      isAuthorized: simpleRolesIsAuthorized,
    }),
  ],
})

export { gSSP, gSP, api }
