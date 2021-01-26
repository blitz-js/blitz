import {DefaultCtx, SessionContext, DefaultPublicData, DefaultAuthorize} from "blitz"
// import {simpleRolesIsAuthorized} from "@blitzjs/server"
import {User} from "db"

declare module "blitz" {
  export interface Ctx extends DefaultCtx {
    session: SessionContext
  }
  export interface PublicData extends DefaultPublicData {
    userId: User["id"]
    views?: number
  }
  // export type IsAuthorized = typeof simpleRolesIsAuthorized
  export interface Authorize extends DefaultAuthorize {
    (roleOrRoles?: string | string[], options?: {if?: boolean}): boolean
  }
}
