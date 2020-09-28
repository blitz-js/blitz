import { DefaultCtx, SessionContext } from "blitz"

declare module "blitz" {
  export interface Ctx extends DefaultCtx {
    session: SessionContext
  }
}
