import db, {FindManyUserArgs} from "db"
import {AuthorizationError} from "blitz"
import {SessionContext} from "@blitzjs/server"

type GetUsersInput = {
  where?: FindManyUserArgs["where"]
  orderBy?: FindManyUserArgs["orderBy"]
  cursor?: FindManyUserArgs["cursor"]
  take?: FindManyUserArgs["take"]
  skip?: FindManyUserArgs["skip"]
  // Only available if a model relationship exists
  // include?: FindManyUserArgs['include']
}

type Ctx = {session?: SessionContext}

export default async function getUsers(
  {where, orderBy, cursor, take, skip}: GetUsersInput,
  ctx: Ctx = {},
) {
  console.log("getUsers roles:", ctx.session?.roles)
  if (!ctx.session?.roles.includes("admin")) throw new AuthorizationError()

  const users = await db.user.findMany({
    where,
    orderBy,
    cursor,
    take,
    skip,
  })

  return users
}
