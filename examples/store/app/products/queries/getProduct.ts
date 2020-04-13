import db, {FindOneProductArgs} from 'prisma'

export default async function getProduct(args: FindOneProductArgs) {
  const product = await db.product.findOne(args)

  return product
}
