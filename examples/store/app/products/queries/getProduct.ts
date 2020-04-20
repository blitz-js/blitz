import db, {FindOneProductArgs} from 'db'

export default async function getProduct(args: FindOneProductArgs) {
  const product = await db.product.findOne(args)

  return product
}
