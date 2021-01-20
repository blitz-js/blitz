import {Ctx} from "blitz"
import db, {Prisma} from "db"

type Get__ModelNames__Input = Pick<
  Prisma.__ModelName__FindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

export default async function get__ModelNames__(
  {where, orderBy, skip = 0, take}: Get__ModelNames__Input,
  ctx: Ctx,
) {
  ctx.session.authorize()

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
    count,
  }
}
