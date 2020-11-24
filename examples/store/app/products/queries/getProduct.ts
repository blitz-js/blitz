import {NotFoundError, Ctx} from "blitz"
import db, {FindOneProductArgs} from "db"

type GetProductInput = {
  where: FindOneProductArgs["where"]
  // Only available if a model relationship exists
  // include?: FindOneProductArgs['include']
}

export default async function getProduct({where}: GetProductInput, _ctx: Ctx) {
  const product = await db.product.findFirst({where})

  if (!product) throw new NotFoundError()

  return product
}
