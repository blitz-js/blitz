import {Ctx} from "blitz"

export default async function logout(_: any, ctx: Ctx) {
  await ctx.session.$revoke()
  return true
}
