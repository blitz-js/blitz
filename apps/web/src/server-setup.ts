import {setupBlitz} from "@blitzjs/next"
import {AuthServerPlugin, PrismaStorage} from "@blitzjs/auth"
import {prisma as db} from "../prisma/index"

const {withBlitz, gSSP, api} = setupBlitz({
  plugins: [
    AuthServerPlugin({
      cookiePrefix: "webapp-cookie-prefix",
      storage: PrismaStorage(db),
      isAuthorized() {
        console.log("isAuthorized")
        return false
      },
    }),
  ],
})

export {withBlitz, gSSP, api}
