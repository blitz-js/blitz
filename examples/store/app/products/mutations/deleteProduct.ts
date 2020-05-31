import db, { ProductDeleteArgs } from "db"

type DeleteProductInput = {
  where: ProductDeleteArgs["where"]
}

export default async function deleteProduct({ where }: DeleteProductInput) {
  const product = await db.product.delete({ where })

  return product
}
