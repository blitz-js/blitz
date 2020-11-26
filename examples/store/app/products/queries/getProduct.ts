import {NotFoundError, Ctx} from "blitz"
import db, {FindFirstProductArgs} from "db"

type GetProductInput = {
  where: FindFirstProductArgs["where"]
  // Only available if a model relationship exists
  // include?: FindFirstProductArgs['include']
}

export default async function getProduct({where}: GetProductInput, _ctx: Ctx) {
  const product = await db.product.findFirst({where})

  if (!product) throw new NotFoundError()

  return product
}
