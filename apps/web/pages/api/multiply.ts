import { PrismaClient } from ".prisma/client"
import { NextApiRequest, NextApiResponse } from "next"

const prisma = new PrismaClient()

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const session = await prisma.session.findFirst({
    where: {
      handle: "test"
    }
  })

  const isAuthorized = !!session

  if (!isAuthorized) {
    res.status(404).json({ message: "No access" })
    return
  }

  const x = parseInt(req.query.x as string)
  const y = parseInt(req.query.y as string)
  res.json({ result: x * y })
}
