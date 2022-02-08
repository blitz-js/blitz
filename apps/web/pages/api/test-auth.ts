import type {NextApiRequest, NextApiResponse} from "next"
import {api} from "../../src/server-setup"

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const blitzContext = (res as any).blitzCtx

  res.status(200).json({name: "John Doe", userId: blitzContext.userId})
}

export default api(handler)
