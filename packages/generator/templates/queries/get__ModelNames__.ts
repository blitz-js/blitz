import {SessionContext} from "blitz"
import db, {FindMany__ModelName__Args} from "db"

type Get__ModelNames__Input = {
  where?: FindMany__ModelName__Args["where"]
  orderBy?: FindMany__ModelName__Args["orderBy"]
  skip?: FindMany__ModelName__Args["skip"]
  take?: FindMany__ModelName__Args["take"]
  // Only available if a model relationship exists
  // include?: FindMany__ModelName__Args['include']
}

export default async function get__ModelNames__(
  {where, orderBy, skip = 0, take}: Get__ModelNames__Input,
  ctx: {session?: SessionContext} = {},
) {
  ctx.session!.authorize()

  const __modelNames__ = await db.__modelName__.findMany({
    where,
    orderBy,
    take,
    skip,
  })

  const count = await db.__modelName__.count()
  const hasMore = typeof take === "number" ? skip + take < count : false
  const nextPage = hasMore ? {take, skip: skip + take!} : null

  return {
    __modelNames__,
    nextPage,
    hasMore,
  }
}
