import { DefaultCtx, SessionContext, DefaultAuthTypes } from "blitz"
import { User } from "db"

declare module "blitz" {
  export interface Ctx extends DefaultCtx {
    session: SessionContext
  }

  export interface AuthTypes extends DefaultAuthTypes {
    userId: User["id"]
  }
}
