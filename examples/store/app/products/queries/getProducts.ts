import { Middleware } from "blitz"
import db, { FindManyProductArgs } from "db"

type GetProductsInput = {
  where?: FindManyProductArgs["where"]
  orderBy?: FindManyProductArgs["orderBy"]
  skip?: FindManyProductArgs["skip"]
  first?: FindManyProductArgs["first"]
  last?: FindManyProductArgs["last"]
  after?: FindManyProductArgs["after"]
  before?: FindManyProductArgs["before"]
  // Only available if a model relationship exists
  // include?: FindManyProductArgs['include']
}

export default async function getProducts(
  { where, orderBy, skip, first, last, after, before }: GetProductsInput,
  ctx?: any
) {
  console.log("HTTP referer:", ctx.referer)

  const products = await db.product.findMany({
    where,
    orderBy,
    skip,
    first,
    last,
    after,
    before,
  })

  return products
}

export const middleware: Middleware[] = [
  async (req, res, next) => {
    await next()
    if (req.method === "POST") {
      console.log("[Middleware] Total product count:", res.blitzResult.length)
    }
  },
]
