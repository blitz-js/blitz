import {setPublicDataForUser} from "@blitzjs/auth"
import {Ctx} from "blitz"

export default async function changeRole({userId, roles}: any, ctx: Ctx) {
  // create two sessions to be changed
  await ctx.session.$create({userId, roles: ["USER"]})
  await ctx.session.$create({userId, roles: ["USER"]})

  await setPublicDataForUser(userId, {roles})
}
