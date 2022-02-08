import {NextApiRequest, NextApiResponse} from "next"
import {prisma} from "../../prisma/index"

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const session = await prisma.session.findFirst({
    where: {
      handle: "test",
    },
  })

  const isAuthorized = !!session

  if (!isAuthorized) {
    res.status(404).json({message: "No access"})
    return
  }

  const x = parseInt(req.query.x as string)
  const y = parseInt(req.query.y as string)
  res.json({result: x * y})
}
