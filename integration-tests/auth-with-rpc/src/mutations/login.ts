import {Ctx} from "blitz"
import db from "../../db"

const getRand = () => Math.random().toString(36).substring(7)

export default async function login(_: any, ctx: Ctx) {
  const user = await db.user.create({data: {email: `${getRand()}@example.com`}})
  await ctx.session.$create({userId: user.id, roles: ["USER"]})
  return true
}
