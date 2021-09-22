import db from "db"
import {BlitzApiRequest, BlitzApiResponse} from "blitz"

export default async function users(_req: BlitzApiRequest, res: BlitzApiResponse) {
  const products = await db.product.findMany()
  res.status(200).send(products)
}
