import db, {FindManyProductArgs} from 'prisma'

export default async function getProducts(args?: FindManyProductArgs) {
  const products = await db.product.findMany(args)

  return products
}
