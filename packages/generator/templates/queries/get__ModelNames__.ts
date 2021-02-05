import {paginate, Ctx} from "blitz"
import db, {Prisma} from "db"

interface Get__ModelNames__Input
  extends Pick<Prisma.__ModelName__FindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default async function get__ModelNames__(
  {where, orderBy, skip = 0, take}: Get__ModelNames__Input,
  ctx: Ctx,
) {
  ctx.session.$authorize()

  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const {items: __modelNames__, hasMore, nextPage, count} = await paginate({
    skip,
    take,
    count: () => db.__modelName__.count({where}),
    query: (paginateArgs) => db.__modelName__.findMany({...paginateArgs, where, orderBy}),
  })

  return {
    __modelNames__,
    nextPage,
    hasMore,
    count,
  }
}
