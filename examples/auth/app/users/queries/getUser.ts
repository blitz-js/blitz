import db, {FindOneUserArgs} from "db"
import {SessionContext} from "blitz"

type GetUserInput = {
  where: FindOneUserArgs["where"]
  select?: FindOneUserArgs["select"]
  // Only available if a model relationship exists
  // include?: FindOneUserArgs['include']
}

export class NotFoundError extends Error {
  statusCode = 404
  constructor(message?: string) {
    super(message)
    this.name = "NotFoundError"
  }
}

export default async function getUser(
  {where, select}: GetUserInput,
  ctx: {session?: SessionContext} = {},
) {
  ctx.session?.authorize(["admin", "user"])

  const user = await db.user.findOne({where, select})

  if (!user) throw new NotFoundError(`User with id ${where.id} does not exist`)

  return user
}
