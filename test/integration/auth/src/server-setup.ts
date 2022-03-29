import {setupBlitz} from "@blitzjs/next"
import {AuthServerPlugin, PrismaStorage} from "@blitzjs/auth"
import db from "../db/index"
import {simpleRolesIsAuthorized} from "@blitzjs/auth"

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
