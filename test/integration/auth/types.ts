import {DefaultCtx, SessionContext, SimpleRolesIsAuthorized} from "blitz"

declare module "blitz" {
  export interface Ctx extends DefaultCtx {
    session: SessionContext
  }
  export interface Session {
    isAuthorized: SimpleRolesIsAuthorized<"user">
    PublicData: {
      userId: number
      role: "user"
    }
  }
}
