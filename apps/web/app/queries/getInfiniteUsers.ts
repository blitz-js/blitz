import {resolver} from "@blitzjs/rpc"
import {paginate} from "blitz"
import db, {Prisma} from "db"

interface GetUsersInput
  extends Pick<Prisma.UserFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(async ({where, orderBy, skip = 0, take = 100}: GetUsersInput) => {
  const {
    items: users,
    hasMore,
    nextPage,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.user.count({where}),
    query: (paginateArgs) => db.user.findMany({...paginateArgs, where, orderBy}),
  })

  return {
    users,
    nextPage,
    hasMore,
    count,
  }
})
