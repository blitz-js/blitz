import {Ctx} from "blitz"
import db, {User} from "db"

export default async function getUsers(_input: {}, ctx: Ctx): Promise<User[]> {
  ctx.session.$authorize()

  const users = await db.user.findMany()

  return users
}
