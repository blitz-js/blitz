import db, {ProductUpdateArgs} from 'db'

export default async function updateProduct(args: ProductUpdateArgs) {
  // Don't allow updating ID
  delete args.data.id

  const product = await db.product.update(args)

  return product
}
