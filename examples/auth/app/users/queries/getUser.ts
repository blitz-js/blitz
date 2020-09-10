import db, {FindOneUserArgs} from "db"
import {SessionContext, NotFoundError} from "blitz"

type GetUserInput = {
  where: FindOneUserArgs["where"]
  select?: FindOneUserArgs["select"]
  // Only available if a model relationship exists
  // include?: FindOneUserArgs['include']
}

export default async function getUser(
  {where, select}: GetUserInput,
  ctx: {session?: SessionContext} = {},
) {
  ctx.session!.authorize(["admin", "user"])

  const user = await db.user.findOne({where: {id: ctx.session!.userId}})
  // const user = await db.user.findOne({where, select})

  if (!user) throw new NotFoundError(`User with id ${where.id} does not exist`)

  return user
}
