import {Ctx} from "blitz"
import db, {Prisma} from "db"

type GetUsersInput = Pick<Prisma.UserFindManyArgs, "where" | "orderBy" | "skip" | "take">

export default async function getUsers({where, orderBy, skip = 0, take}: GetUsersInput, ctx: Ctx) {
  ctx.session.authorize()

  const users = await db.user.findMany({
    where,
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
}
