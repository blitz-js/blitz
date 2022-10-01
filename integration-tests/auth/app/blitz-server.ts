import {setupBlitzServer} from "@blitzjs/next"
import {AuthServerPlugin, PrismaStorage} from "@blitzjs/auth"
import {simpleRolesIsAuthorized} from "@blitzjs/auth"
import db from "../db/index"

const {gSSP, gSP, api} = setupBlitzServer({
  plugins: [
    AuthServerPlugin({
      cookiePrefix: "auth-tests-cookie-prefix",
      storage: PrismaStorage(db),
      isAuthorized: simpleRolesIsAuthorized,
    }),
  ],
})

export {gSSP, gSP, api}
