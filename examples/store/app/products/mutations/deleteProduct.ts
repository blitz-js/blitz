import db, {Prisma} from "db"

type DeleteProductInput = {
  where: Prisma.ProductDeleteArgs["where"]
}

export default async function deleteProduct({where}: DeleteProductInput) {
  const product = await db.product.delete({where})

  return product
}
