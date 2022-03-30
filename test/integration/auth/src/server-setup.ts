import {setupBlitz} from "@blitzjs/next"
import {AuthServerPlugin, PrismaStorage} from "@blitzjs/auth"
import {simpleRolesIsAuthorized} from "@blitzjs/auth"
import {prisma as db} from "../prisma/index"

const {gSSP, gSP, api} = setupBlitz({
  plugins: [
    AuthServerPlugin({
      cookiePrefix: "webapp-cookie-prefix",
      storage: PrismaStorage(db),
      isAuthorized: simpleRolesIsAuthorized,
    }),
  ],
})

export {gSSP, gSP, api}
