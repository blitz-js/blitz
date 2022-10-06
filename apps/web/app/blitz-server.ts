import {setupBlitzServer} from "@blitzjs/next"
import {AuthServerPlugin, PrismaStorage} from "@blitzjs/auth"
import {simpleRolesIsAuthorized} from "@blitzjs/auth"
import {BlitzLogger} from "blitz"
import db from "db"

const {gSSP, gSP, api} = setupBlitzServer({
  plugins: [
    AuthServerPlugin({
      cookiePrefix: "webapp-cookie-prefix",
      storage: PrismaStorage(db),
      isAuthorized: simpleRolesIsAuthorized,
    }),
  ],
  log: {
    logger: BlitzLogger({
      colorizePrettyLogs: true,
      prefix: ["[blitz]"],
    }),
    logLevel: "error",
  },
})

export {gSSP, gSP, api}
