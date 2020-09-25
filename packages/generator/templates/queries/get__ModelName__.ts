import {Ctx, NotFoundError} from "blitz"
import db, {FindOne__ModelName__Args} from "db"

type Get__ModelName__Input = {
  where: FindOne__ModelName__Args["where"]
}

export default async function get__ModelName__({where}: Get__ModelName__Input, {session}: Ctx) {
  session.authorize()

  const __modelName__ = await db.__modelName__.findOne({where})

  if (!__modelName__) throw new NotFoundError()

  return __modelName__
}
