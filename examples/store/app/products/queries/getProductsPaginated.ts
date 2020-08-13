import db, {FindManyProductArgs} from "db"

type GetProductsPaginatedInput = {
  where?: FindManyProductArgs["where"]
  orderBy?: FindManyProductArgs["orderBy"]
  skip?: FindManyProductArgs["skip"]
  cursor?: FindManyProductArgs["cursor"]
  take?: FindManyProductArgs["take"]
  // Only available if a model relationship exists
  // include?: FindManyProductArgs['include']
}

export default async function getProductsPaginated({
  where,
  orderBy,
  take,
  skip,
}: GetProductsPaginatedInput) {
  const products = await db.product.findMany({
    where,
    orderBy,
    take,
    skip,
  })

  const count = await db.product.count()
  const hasMore = skip! + take! < count

  return {
    products,
    hasMore,
  }
}
