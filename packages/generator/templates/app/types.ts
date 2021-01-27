import { DefaultCtx, SessionContext } from "blitz"
import { simpleRolesIsAuthorized } from "@blitzjs/server"
import { User } from "db"

declare module "blitz" {
  export interface Ctx extends DefaultCtx {
    session: SessionContext
  }
  export interface Session {
    publicData: {
      userId: User["id"]
      roles: string[]
    }
    isAuthorized: typeof simpleRolesIsAuthorized
  }
}
