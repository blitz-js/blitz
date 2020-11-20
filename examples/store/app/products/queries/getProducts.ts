import {Middleware} from "blitz"
import db, {FindManyProductArgs, Product} from "db"
import {sum} from "lodash"

export function averagePrice(products: Product[]) {
  const prices = products.map((p) => p.price ?? 0)
  return sum(prices) / prices.length
}

type GetProductsInput = {
  where?: FindManyProductArgs["where"]
  orderBy?: FindManyProductArgs["orderBy"]
  skip?: FindManyProductArgs["skip"]
  cursor?: FindManyProductArgs["cursor"]
  take?: FindManyProductArgs["take"]
  // Only available if a model relationship exists
  // include?: FindManyProductArgs['include']
}

export default async function getProducts(
  {where, orderBy, skip = 0, cursor, take}: GetProductsInput,
  ctx: Record<any, unknown> = {},
) {
  if (ctx.referer) {
    console.log("HTTP referer:", ctx.referer)
  }

  const products = await db.product.findMany({
    where,
    orderBy,
    skip,
    cursor,
    take,
  })

  const count = await db.product.count()
  const hasMore = typeof take === "number" ? skip + take < count : false
  const nextPage = hasMore ? {take, skip: skip + take!} : null

  return {
    products,
    nextPage,
    hasMore,
  }
}

export const middleware: Middleware[] = [
  async (req, res, next) => {
    await next()
    if (req.method !== "HEAD" && Array.isArray(res.blitzResult)) {
      console.log("[Middleware] Total product count:", res.blitzResult.length, "\n")
    }
  },
]
