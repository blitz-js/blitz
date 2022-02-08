import type { NextApiRequest, NextApiResponse } from 'next'
import { api } from '../../src/server-setup'

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const blitzContext = (res as any).blitzCtx

  console.log({ blitzContext })

  res.status(200).json({ name: 'John Doe', id: blitzContext?.userId })
}

export default api(handler)
