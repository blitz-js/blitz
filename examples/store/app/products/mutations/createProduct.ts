import db, {Prisma} from "db"

type CreateProductInput = {
  data: Prisma.ProductCreateArgs["data"]
}
export default async function createProduct({data}: CreateProductInput) {
  const product = await db.product.create({data})

  return product
}
