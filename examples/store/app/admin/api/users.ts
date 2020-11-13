import db, {Product} from "db"
import {BlitzApiRequest, BlitzApiResponse} from "blitz"

function mean(numbers: number[]) {
  const sorted = numbers.sort()

  if (sorted.length % 2 === 0) {
    return (sorted[sorted.length / 2] + sorted[sorted.length / 2 + 1]) / 2
  } else {
    return sorted[(sorted.length - 1) / 2]
  }
}

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
