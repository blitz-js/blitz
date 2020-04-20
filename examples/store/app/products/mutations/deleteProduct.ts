import db, {ProductDeleteArgs} from 'db'

export default async function deleteProduct(args: ProductDeleteArgs) {
  const product = await db.product.delete(args)

  return product
}
