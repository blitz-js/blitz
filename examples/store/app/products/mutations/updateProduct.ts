import db, {Prisma} from "db"
import {Ctx} from "blitz"

type UpdateProductInput = {
  where: Prisma.ProductUpdateArgs["where"]
  data: Prisma.ProductUpdateArgs["data"]
}

export default async function updateProduct({where, data}: UpdateProductInput, _ctx: Ctx) {
  const product = await db.product.update({where, data})

  return product
}
