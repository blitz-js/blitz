import db from "db"
import { NextApiRequest,NextApiResponse } from "next"

export default async function users(_req: NextApiRequest, res: NextApiResponse) {
  const products = await db.product.findMany()
  res.status(200).send(products)
}
