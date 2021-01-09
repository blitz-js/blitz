import db, {ProductUpdateArgs} from "db"
import {Ctx} from "blitz"

type UpdateProductInput = {
  where: ProductUpdateArgs["where"]
  data: ProductUpdateArgs["data"]
}

export default async function updateProduct({where, data}: UpdateProductInput, _ctx: Ctx) {
  const product = await db.product.update({where, data})

  return product
}
