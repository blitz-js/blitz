import db, {ProductDeleteArgs} from 'prisma'

export default async function deleteProduct(args: ProductDeleteArgs) {
  const product = await db.product.delete(args)

  return product
}
