import {Ctx} from "blitz"

export default async function login(_: any, ctx: Ctx) {
  await ctx.session.$create({userId: 1, role: "USER"})
  return true
}
