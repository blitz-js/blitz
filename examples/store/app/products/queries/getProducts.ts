import { Middleware } from "blitz"
import db, { FindManyProductArgs } from "db"

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
  { where, orderBy, skip, cursor, take }: GetProductsInput,
  ctx?: any
) {
  console.log("HTTP referer:", ctx.referer)

  const products = await db.product.findMany({
    where,
    orderBy,
    skip,
    cursor,
    take,
  })

  return products
}

export const middleware: Middleware[] = [
  // async (req, res, next) => {
  //   await next()
  //   // console.log("THROWING ERROR")
  //   throw new Error("hey")
  //   // if (req.method === "POST") {
  //   //   // console.log("[Middleware] Total product count:", res.blitzResult.length)
  //   // }
  // },
]
