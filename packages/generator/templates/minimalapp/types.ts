import { DefaultCtx } from "blitz"

declare module "blitz" {
  export interface Ctx extends DefaultCtx {}
}
