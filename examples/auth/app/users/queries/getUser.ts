import db, {FindOneUserArgs} from "db"
import {SessionContext} from "blitz"

type GetUserInput = {
  where: FindOneUserArgs["where"]
  // Only available if a model relationship exists
  // include?: FindOneUserArgs['include']
}

export default async function getUser(
  {where /* include */}: GetUserInput,
  ctx: {session?: SessionContext} = {},
) {
  ctx.session?.authorize(["user"])

  const user = await db.user.findOne({where})

  return user
}
