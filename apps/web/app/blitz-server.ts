import {setupBlitzServer} from "@blitzjs/next"
import {AuthServerPlugin, PrismaStorage} from "@blitzjs/auth"
import db from "db"
import {simpleRolesIsAuthorized} from "@blitzjs/auth"

const {gSSP, gSP, api} = setupBlitzServer({
  plugins: [
    AuthServerPlugin({
      cookiePrefix: "webapp-cookie-prefix",
      // TODO fix type
      storage: PrismaStorage(db as any),
      isAuthorized: simpleRolesIsAuthorized,
    }),
  ],
})

export {gSSP, gSP, api}
