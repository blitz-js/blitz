import type {BlitzCliConfig} from "blitz"
import {setupBlitzServer} from "@blitzjs/next"
import {AuthServerPlugin, PrismaStorage} from "@blitzjs/auth"
import db from "../prisma"
import {simpleRolesIsAuthorized} from "@blitzjs/auth"
import {BlitzLogger} from "blitz"
import {RpcServerPlugin} from "@blitzjs/rpc"

const {api, getBlitzContext, useAuthenticatedBlitzContext, invoke, withBlitzAuth} =
  setupBlitzServer({
    plugins: [
      AuthServerPlugin({
        cookiePrefix: "web-cookie-prefix",
        storage: PrismaStorage(db),
        isAuthorized: simpleRolesIsAuthorized,
      }),
      RpcServerPlugin({
        logging: {
          disablelevel: "debug",
        },
        onInvokeError(error) {
          console.log("onInvokeError", error)
        },
      }),
    ],
    logger: BlitzLogger({}),
  })

export {api, getBlitzContext, useAuthenticatedBlitzContext, invoke, withBlitzAuth}

export const cliConfig: BlitzCliConfig = {
  customTemplates: "src/templates",
}
