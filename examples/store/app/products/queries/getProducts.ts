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

export default async function getProducts({
  where,
  orderBy,
  skip,
  cursor,
  take,
}: GetProductsInput) {
  const products = await db.product.findMany({
    where,
    orderBy,
    skip,
    cursor,
    take,
  })

  return products
}
