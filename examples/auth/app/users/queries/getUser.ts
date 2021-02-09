import {Ctx, NotFoundError} from "blitz"
import db, {Prisma} from "db"

type GetUserInput = {
  where: Prisma.UserFindFirstArgs["where"]
}

export default async function getUser({where}: GetUserInput, ctx: Ctx) {
  if (!ctx.session.userId) return null

  const user = await db.user.findFirst({where})

  if (!user) throw new NotFoundError(`User with id ${where?.id} does not exist`)

  const {hashedPassword, ...rest} = user

  return rest
}
