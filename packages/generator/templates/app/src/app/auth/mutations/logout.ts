import {Ctx} from "blitz"

export default async function logout(_: any, ctx: Ctx) {
  return await ctx.session.$revoke()
}
