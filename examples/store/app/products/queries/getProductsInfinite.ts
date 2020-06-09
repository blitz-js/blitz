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

export default async function getProducts({ where, orderBy, take, skip }: GetProductsInput) {
  const products = await db.product.findMany({
    where,
    orderBy,
    take,
    skip,
  })

  const count = await db.product.count()
  const hasMore = skip + take < count
  const nextPage = hasMore ? { take, skip: skip + take } : null

  return {
    products,
    nextPage,
  }
}
