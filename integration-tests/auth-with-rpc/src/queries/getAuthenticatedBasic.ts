import {Ctx} from "blitz"
import delay from "delay"

export default async function getAuthenticatedBasic(_: any, ctx: Ctx) {
  await delay(10)
  ctx.session.$authorize()
  return "authenticated-basic-result"
}
