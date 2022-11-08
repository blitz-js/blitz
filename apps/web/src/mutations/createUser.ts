import {Ctx} from "blitz"
import db, {User} from "db"

export default async function createUser(
  input: {name: string; email: string},
  ctx: Ctx,
): Promise<User> {
  ctx.session.$authorize()

  const user = await db.user.create({data: {name: input.name, email: input.email}})

  return user
}
