import db, {FindOneUserArgs} from "db"
import {SessionContext} from "blitz"

type GetUserInput = {
  where: FindOneUserArgs["where"]
  select: FindOneUserArgs["select"]
  // Only available if a model relationship exists
  // include?: FindOneUserArgs['include']
}

export default async function getUser(
  {where, select}: GetUserInput,
  ctx: {session?: SessionContext} = {},
) {
  ctx.session?.authorize(["admin", "user"])

  const user = await db.user.findOne({where, select})

  return user
}
