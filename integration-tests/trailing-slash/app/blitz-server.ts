import {setupBlitzServer} from "@blitzjs/next"
import {AuthServerPlugin, PrismaStorage} from "@blitzjs/auth"
import {simpleRolesIsAuthorized} from "@blitzjs/auth"
import {prisma as db} from "../prisma/index"

const {gSSP, gSP, api} = setupBlitzServer({
  plugins: [
    AuthServerPlugin({
      cookiePrefix: "trailing-slash-tests-cookie-prefix",
      storage: PrismaStorage(db as any),
      isAuthorized: simpleRolesIsAuthorized,
    }),
  ],
})

export {gSSP, gSP, api}
