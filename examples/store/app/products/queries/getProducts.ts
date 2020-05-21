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

export default async function getProducts({
  where,
  orderBy,
  skip,
  first,
  last,
  after,
  before,
}: GetProductsInput) {
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
