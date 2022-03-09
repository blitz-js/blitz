import {setupBlitz} from "@blitzjs/next"
import {AuthServerPlugin, PrismaStorage} from "@blitzjs/auth"
import {prisma as db} from "../prisma/index"
import {simpleRolesIsAuthorized} from "@blitzjs/auth"

const {gSSP, gSP, api} = setupBlitz({
  plugins: [
    AuthServerPlugin({
      // todo: pass Ctx as AuthServerPlugin<Custom session type>({
      cookiePrefix: "webapp-cookie-prefix",
      storage: PrismaStorage(db),
      isAuthorized: simpleRolesIsAuthorized,
    }),
  ],
})

export {gSSP, gSP, api}
