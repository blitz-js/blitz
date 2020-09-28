import {Ctx, NotFoundError} from "blitz"
import db, {FindOneUserArgs} from "db"

type GetUserInput = {
  where: FindOneUserArgs["where"]
}

export default async function getUser({where}: GetUserInput, {session}: Ctx) {
  session.authorize(["admin", "user"])

  const user = await db.user.findOne({where})

  if (!user) throw new NotFoundError(`User with id ${where.id} does not exist`)

  const {hashedPassword, ...rest} = user

  return rest
}
