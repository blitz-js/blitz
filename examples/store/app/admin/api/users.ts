import db, {Product} from "db"
import {BlitzApiRequest, BlitzApiResponse} from "blitz"
import {mean} from "lodash"

// this is here mainly as an integration test for
// importing from api/
export function meanPrice(products: Product[]) {
  const prices = products.map((p) => p.price).filter((p) => !!p) as number[]
  return mean(prices)
}

export default async function users(_req: BlitzApiRequest, res: BlitzApiResponse) {
  const products = await db.product.findMany()
  res.status(200).send(products)
}
