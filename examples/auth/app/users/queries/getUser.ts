import {Ctx, NotFoundError} from "blitz"
import db, {FindOneUserArgs} from "db"

type GetUserInput = {
  where: FindOneUserArgs["where"]
  select?: FindOneUserArgs["select"]
}

export default async function getUser({where, select}: GetUserInput, {session}: Ctx) {
  session.authorize(["admin", "user"])

  const user = await db.user.findOne({where, select})

  if (!user) throw new NotFoundError(`User with id ${where.id} does not exist`)

  return user
}
