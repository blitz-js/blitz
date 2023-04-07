import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetProjectsInput
  extends Pick<Prisma.UserFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetProjectsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: users,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.user.count({ where }),
      query: (paginateArgs) => db.user.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      users,
      nextPage,
      hasMore,
      count,
    }
  }
)
