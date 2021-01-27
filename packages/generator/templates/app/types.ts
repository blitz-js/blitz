import { DefaultCtx, SessionContext, DefaultPublicData } from "blitz"
import { simpleRolesIsAuthorized } from "@blitzjs/server"
import { User } from "db"

declare module "blitz" {
  export interface Ctx extends DefaultCtx {
    session: SessionContext
  }
  export interface PublicData extends DefaultPublicData {
    userId: User["id"]
  }
  export interface Session {
    isAuthorized: typeof simpleRolesIsAuthorized
  }
}
