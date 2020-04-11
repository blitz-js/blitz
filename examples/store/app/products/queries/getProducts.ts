import db, {FindManyProductArgs} from 'prisma'

export default async function getProducts(args?: FindManyProductArgs) {
  const product = await db.product.findMany(args)

  return product
}
