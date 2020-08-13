import {SessionContext} from "blitz"
import db, {__ModelName__DeleteArgs} from "db"

type Delete__ModelName__Input = {
  where: __ModelName__DeleteArgs["where"]
}

export default async function delete__ModelName__(
  {where}: Delete__ModelName__Input,
  ctx: {session?: SessionContext} = {},
) {
  ctx.session!.authorize()

  const __modelName__ = await db.__modelName__.delete({where})

  return __modelName__
}
