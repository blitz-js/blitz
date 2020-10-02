import {Ctx} from "blitz"
import db, {FindManyUserArgs} from "db"

type GetUsersInput = {
  where?: FindManyUserArgs["where"]
  orderBy?: FindManyUserArgs["orderBy"]
  cursor?: FindManyUserArgs["cursor"]
  take?: FindManyUserArgs["take"]
  skip?: FindManyUserArgs["skip"]
}

export default async function getUsers(
  {where, orderBy, cursor, take, skip}: GetUsersInput,
  {session}: Ctx,
) {
  session.authorize(["admin", "user"])

  const users = await db.user.findMany({
    where,
    select: {id: true},
    orderBy,
    cursor,
    take,
    skip,
  })

  return users
}
