import {setupBlitzServer} from "@blitzjs/next"
import {AuthServerPlugin, PrismaStorage} from "@blitzjs/auth"
import {prisma as db} from "../prisma/index"
import {simpleRolesIsAuthorized} from "@blitzjs/auth"
import {RpcServerPlugin} from "@blitzjs/rpc"

const {gSSP, gSP, api} = setupBlitzServer({
  plugins: [
    AuthServerPlugin({
      cookiePrefix: "webapp-cookie-prefix",
      // TODO fix type
      storage: PrismaStorage(db as any),
      isAuthorized: simpleRolesIsAuthorized,
    }),
    RpcServerPlugin({}),
  ],
})

export {gSSP, gSP, api}
