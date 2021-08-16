import {Middleware, paginate} from "blitz"
import db, {Prisma} from "db"

type GetProductsInput = {
  where?: Prisma.ProductFindManyArgs["where"]
  orderBy?: Prisma.ProductFindManyArgs["orderBy"]
  skip?: number
  take?: number
}

export const middleware: Middleware[] = [
  async (req, res, next) => {
    await next()
    if (req.method !== "HEAD" && Array.isArray(res.blitzResult)) {
      console.log("[Middleware] Total product count:", res.blitzResult.length, "\n")
    }
  },
]

export default async function getProducts(
  {where, orderBy, skip = 0, take = 100}: GetProductsInput,
  ctx: Record<any, unknown> = {},
) {
  if (ctx.referer) {
    console.log("HTTP referer:", ctx.referer)
  }

  console.log("this line should not be included in the frontend bundle")

  const {items: products, hasMore, nextPage, count} = await paginate({
    skip,
    take,
    count: () => db.product.count({where}),
    query: (paginateArgs) => db.product.findMany({...paginateArgs, where, orderBy}),
  })

  return {
    products,
    hasMore,
    nextPage,
    count,
  }
}
