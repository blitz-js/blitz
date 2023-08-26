import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetRecipesInput
  extends Pick<Prisma.RecipeFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetRecipesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: recipes,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.recipe.count({ where }),
      query: (paginateArgs) => db.recipe.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      recipes,
      nextPage,
      hasMore,
      count,
    }
  }
)
