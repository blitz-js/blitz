import {Middleware} from "blitz"
import db, {Prisma, Product} from "db"
import {sum} from "lodash"

export function averagePrice(products: Product[]) {
  const prices = products.map((p) => p.price ?? 0)
  return sum(prices) / prices.length
}

type GetProductsInput = {
  where?: Prisma.ProductFindManyArgs["where"]
  orderBy?: Prisma.ProductFindManyArgs["orderBy"]
  skip?: Prisma.ProductFindManyArgs["skip"]
  cursor?: Prisma.ProductFindManyArgs["cursor"]
  take?: Prisma.ProductFindManyArgs["take"]
  // Only available if a model relationship exists
  // include?: Prisma.ProductFindManyArgs['include']
}

export default async function getProducts(
  {where, orderBy, skip = 0, cursor, take}: GetProductsInput,
  ctx: Record<any, unknown> = {},
) {
  if (ctx.referer) {
    console.log("HTTP referer:", ctx.referer)
  }

  console.log("this line should not be included in the frontend bundle")

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
