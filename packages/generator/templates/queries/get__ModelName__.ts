import {protect, NotFoundError} from "blitz"
import db, {FindFirst__ModelName__Args} from "db"

type Get__ModelName__Input = FindFirst__ModelName__Args["where"]

export default protect({}, async function get__ModelName__(
  input: Get__ModelName__Input,
  {session},
) {
  const __modelName__ = await db.__modelName__.findFirst({where: input})

  if (!__modelName__) throw new NotFoundError()

  return __modelName__
})
