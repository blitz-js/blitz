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

export default async function getProducts({ where, orderBy, first, skip }: GetProductsInput) {
  const products = await db.product.findMany({
    where,
    orderBy,
    first,
    skip,
  })

  const count = await db.product.count()
  const hasMore = skip + first < count
  const nextPage = hasMore ? { first, skip: skip + first } : null

  return {
    products,
    nextPage,
  }
}
