import {setupBlitzServer} from "@blitzjs/next"
import {AuthServerPlugin, PrismaStorage} from "@blitzjs/auth"
import db from "../db"
import {simpleRolesIsAuthorized} from "@blitzjs/auth"
import {BlitzLogger} from "blitz"
import {RpcServerPlugin} from "@blitzjs/rpc"

export const {api, getBlitzContext, blitzAuthAppContext, withBlitzAuth} = setupBlitzServer({
  plugins: [
    AuthServerPlugin({
      cookiePrefix: "auth-tests-cookie-prefix",
      storage: PrismaStorage(db),
      isAuthorized: simpleRolesIsAuthorized,
    }),
    RpcServerPlugin({}),
  ],
  logger: BlitzLogger({}),
})
