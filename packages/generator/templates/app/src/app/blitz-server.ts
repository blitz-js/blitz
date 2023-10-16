import {setupBlitzServer} from "@blitzjs/next"
import {AuthServerPlugin, PrismaStorage,simpleRolesIsAuthorized} from "@blitzjs/auth"
import db from "db"
import {BlitzLogger} from "blitz"
import {RpcServerPlugin} from "@blitzjs/rpc"

const {api, getBlitzContext, useAuthenticatedBlitzContext, invoke} = setupBlitzServer({
  plugins: [
    AuthServerPlugin({
      cookiePrefix: "__safeNameSlug__",
      storage: PrismaStorage(db),
      isAuthorized: simpleRolesIsAuthorized,
    }),
    RpcServerPlugin({}),
  ],
  logger: BlitzLogger({}),
})

export {api, getBlitzContext, useAuthenticatedBlitzContext, invoke}
