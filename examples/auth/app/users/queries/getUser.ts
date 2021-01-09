import {Ctx, NotFoundError} from "blitz"
import db, {Prisma} from "db"

type GetUserInput = {
  where: Prisma.FindUniqueUserArgs["where"]
}

export default async function getUser({where}: GetUserInput, ctx: Ctx) {
  ctx.session.authorize()

  const user = await db.user.findFirst({where})

  if (!user) throw new NotFoundError(`User with id ${where.id} does not exist`)

  const {hashedPassword, ...rest} = user

  return rest
}
