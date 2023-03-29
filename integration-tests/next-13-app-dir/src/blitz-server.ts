import {setupBlitzServer} from "@blitzjs/next"
import {AuthServerPlugin, PrismaStorage} from "@blitzjs/auth"
import db from "../db"
import {simpleRolesIsAuthorized} from "@blitzjs/auth"
import {BlitzLogger} from "blitz"

const {api, getBlitzContext} = setupBlitzServer({
  plugins: [
    AuthServerPlugin({
      cookiePrefix: "auth-tests-cookie-prefix",
      storage: PrismaStorage(db),
      isAuthorized: simpleRolesIsAuthorized,
    }),
  ],
  logger: BlitzLogger({}),
})

export {api, getBlitzContext}
