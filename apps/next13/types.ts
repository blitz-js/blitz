import {SimpleRolesIsAuthorized} from "@blitzjs/auth"
import {User} from "./prisma"

declare module "@blitzjs/auth" {
  export interface Session {
    isAuthorized: SimpleRolesIsAuthorized
    PublicData: {
      userId: User["id"]
      email: User["email"]
    }
  }
}
