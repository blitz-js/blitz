import {paginate, Ctx} from "blitz"
import { prisma } from "db"
import { Prisma } from "@prisma/client"

interface Get__ModelNames__Input
  extends Pick<Prisma.__ModelName__FindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default async function Get__ModelNames(input: Get__ModelNames__Input, ctx: Ctx) {
  ctx.session.$isAuthorized()

   // TODO: in multi-tenant app, you must add validation to ensure correct tenant
   const {items: __modelNames__, hasMore, nextPage, count} = await paginate({
    skip: input.skip,
    take: input.take,
    count: () => prisma.__modelName__.count({where: input.where}),
    query: (paginateArgs) => prisma.__modelName__.findMany({...paginateArgs, where: input.where, orderBy: input.orderBy}),
  })

  return {
    __modelNames__,
    nextPage,
    hasMore,
    count,
  }

}


