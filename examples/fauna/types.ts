import { DefaultCtx, SessionContext } from "blitz"
import { simpleRolesIsAuthorized } from "@blitzjs/server"

declare module "blitz" {
  export interface Ctx extends DefaultCtx {
    session: SessionContext
  }
  export interface Session {
    isAuthorized: typeof simpleRolesIsAuthorized
    publicData: {
      userId: string
      roles: string[]
    }
  }
}
