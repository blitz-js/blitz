import db, {FindManyUserArgs} from "db"
import {SessionContext} from "blitz"

type GetUsersInput = {
  where?: FindManyUserArgs["where"]
  orderBy?: FindManyUserArgs["orderBy"]
  cursor?: FindManyUserArgs["cursor"]
  take?: FindManyUserArgs["take"]
  skip?: FindManyUserArgs["skip"]
  // Only available if a model relationship exists
  // include?: FindManyUserArgs['include']
}

export default async function getUsers(
  {where, orderBy, cursor, take, skip}: GetUsersInput,
  ctx: {session?: SessionContext} = {},
) {
  ctx.session?.authorize(["admin"])

  const users = await db.user.findMany({
    where,
    orderBy,
    cursor,
    take,
    skip,
  })

  return users
}
