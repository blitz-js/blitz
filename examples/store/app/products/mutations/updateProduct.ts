import db, {ProductUpdateArgs} from "db"

type UpdateProductInput = {
  where: ProductUpdateArgs["where"]
  data: ProductUpdateArgs["data"]
}

export default async function updateProduct({where, data}: UpdateProductInput) {
  const product = await db.product.update({where, data})

  return product
}
