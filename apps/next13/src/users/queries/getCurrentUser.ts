import {Ctx} from "blitz"
import db from "../../../prisma"

export default async function getCurrentUser(input: null, ctx: Ctx) {
  if (!ctx.session.userId) return null
  const user = await db.user.findFirst({
    where: {id: ctx.session.userId},
    select: {id: true, name: true, email: true},
  })

  return user
}

export const config = {
  httpMethod: "GET",
}
