import db, {FindManyProductArgs} from 'db'

export default async function getProducts(args?: FindManyProductArgs) {
  const products = await db.product.findMany(args)

  return products
}
