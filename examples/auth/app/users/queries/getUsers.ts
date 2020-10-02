import {protect} from "blitz"
import db, {FindManyUserArgs} from "db"

type GetUsersInput = Pick<FindManyUserArgs, "orderBy" | "skip" | "take">

export default protect({}, async function getUsers(
  {orderBy, skip = 0, take}: GetUsersInput,
  {session},
) {
  const users = await db.user.findMany({
    where: {
      // add your selection criteria here
    },
    orderBy,
    take,
    skip,
  })

  const count = await db.user.count()
  const hasMore = typeof take === "number" ? skip + take < count : false
  const nextPage = hasMore ? {take, skip: skip + take!} : null

  return {
    users,
    nextPage,
    hasMore,
    count,
  }
})
