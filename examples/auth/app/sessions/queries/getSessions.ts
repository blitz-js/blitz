import {SessionContext} from "blitz"
import db, {FindManySessionArgs} from "db"

type GetSessionsInput = {
  where?: FindManySessionArgs["where"]
  orderBy?: FindManySessionArgs["orderBy"]
  skip?: FindManySessionArgs["skip"]
  take?: FindManySessionArgs["take"]
  // Only available if a model relationship exists
  // include?: FindManySessionArgs['include']
}

export default async function getSessions(
  {where, orderBy, skip = 0, take}: GetSessionsInput,
  ctx: {session?: SessionContext} = {},
) {
  ctx.session!.authorize()

  const sessions = await db.session.findMany({
    where,
    orderBy,
    take,
    skip,
  })

  const count = await db.session.count()
  const hasMore = typeof take === "number" ? skip + take < count : false
  const nextPage = hasMore ? {take, skip: skip + take!} : null

  return {
    sessions,
    nextPage,
    hasMore,
  }
}
