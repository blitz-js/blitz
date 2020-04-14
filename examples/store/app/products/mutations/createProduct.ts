import db, {ProductCreateArgs} from 'db'

export default async function createProduct(args: ProductCreateArgs) {
  const product = await db.product.create(args)

  return product
}
