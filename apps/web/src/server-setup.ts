import {setupBlitz} from "@blitzjs/next"
import {AuthServerPlugin, PrismaStorage, SimpleRolesIsAuthorized} from "@blitzjs/auth"
import {prisma as db} from "../prisma/index"
import {simpleRolesIsAuthorized} from "@blitzjs/auth"

const {gSSP, gSP, api} = setupBlitz({
  plugins: [
    AuthServerPlugin({
      cookiePrefix: "webapp-cookie-prefix",
      storage: PrismaStorage(db),
      isAuthorized: simpleRolesIsAuthorized,
    }),
  ],
})

type User = {
  id: number
}

type Role = "admin" | "user"

// It would be cool to pass this as a generic parameter to AuthServerPlugin
declare module "@blitzjs/auth" {
  export interface Session {
    isAuthorized: SimpleRolesIsAuthorized<Role>
    PublicData: {
      userId: User["id"]
    }
  }
}

export {gSSP, gSP, api}
