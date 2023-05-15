import {Ctx} from "blitz"
import db from "../../../db"
import { Role } from "@/types"

export default async function getCurrentUser(input: null, ctx: Ctx) {
  if (!ctx.session.userId) return null
  const user = await db.user.findFirst({
    where: {id: ctx.session.userId},
    select: {id: true, name: true, email: true, role: true},
  })

  return user
}

export const config = {
  httpMethod: "GET",
}
