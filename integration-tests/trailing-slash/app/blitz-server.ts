import {setupBlitzServer} from "@blitzjs/next"
import {AuthServerPlugin, PrismaStorage, simpleRolesIsAuthorized} from "@blitzjs/auth"
import {prisma} from "../prisma"

const {gSSP, gSP, api} = setupBlitzServer({
  plugins: [
    AuthServerPlugin({
      cookiePrefix: "web-cookie-prefix",
      // TODO fix type
      storage: PrismaStorage(prisma as any),
      isAuthorized: simpleRolesIsAuthorized,
    }),
  ],
})

export {gSSP, gSP, api}
