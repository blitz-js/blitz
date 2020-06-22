import db, {FindOneProductArgs} from "db"

type GetProductInput = {
  where: FindOneProductArgs["where"]
  // Only available if a model relationship exists
  // include?: FindOneProductArgs['include']
}

export default async function getProduct({where}: GetProductInput) {
  const product = await db.product.findOne({where})

  return product
}
