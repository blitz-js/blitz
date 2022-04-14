import {Ctx} from "blitz"
import {prisma} from "../../prisma"
import {User} from "prisma"

export default async function createUser(
  input: {name: string; email: string},
  ctx: Ctx,
): Promise<User> {
  ctx.session.$authorize()

  const user = await prisma.user.create({data: {name: input.name, email: input.email}})

  return user
}
