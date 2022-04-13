import {Ctx} from "blitz"
import {prisma} from "../../prisma"
import {User} from "prisma"

export default async function getUsers(_input: {}, ctx: Ctx): Promise<User[]> {
  ctx.session.$authorize()

  const users = await prisma.user.findMany()

  return users
}
