import {Ctx} from "blitz"
import db from "../../../prisma"

export default async function getCurrentUser() {
  // if (!session.userId) return null
  console.log("getCurrentUser")
  const user = await db.user.findFirst({
    select: {id: true, name: true, email: true, role: true},
  })

  return user
}

export const config = {
  httpMethod: "GET",
}
