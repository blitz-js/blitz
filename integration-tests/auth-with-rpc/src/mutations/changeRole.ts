import {setPublicDataForUser} from "@blitzjs/auth"
import {Ctx} from "blitz"

export default async function changeRole({userId, role}: any, ctx: Ctx) {
  // create two sessions to be changed
  await ctx.session.$create({userId, role: "USER"})
  await ctx.session.$create({userId, role: "USER"})

  await setPublicDataForUser(userId, {role})
}
