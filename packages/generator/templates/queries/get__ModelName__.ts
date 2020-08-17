import {NotFoundError, SessionContext} from "blitz"
import db, {FindOne__ModelName__Args} from "db"

type Get__ModelName__Input = {
  where: FindOne__ModelName__Args["where"]
  // Only available if a model relationship exists
  // include?: FindOne__ModelName__Args['include']
}

export default async function get__ModelName__(
  {where /* include */}: Get__ModelName__Input,
  ctx: {session?: SessionContext} = {},
) {
  ctx.session!.authorize()

  const __modelName__ = await db.__modelName__.findOne({where})

  if (!__modelName__) throw new NotFoundError()

  return __modelName__
}
