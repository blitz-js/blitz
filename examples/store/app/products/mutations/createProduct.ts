import db, { ProductCreateArgs } from "db"

type CreateProductInput = {
  data: ProductCreateArgs["data"]
}
export default async function createProduct({ data }: CreateProductInput) {
  const product = await db.product.create({ data })

  return product
}
