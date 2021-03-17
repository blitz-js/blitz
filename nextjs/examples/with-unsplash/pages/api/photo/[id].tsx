import { NextApiRequest, NextApiResponse } from 'next'
import Unsplash, { toJson } from 'unsplash-js'

export default function getCollectionPhotos(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { id },
  } = req

  return new Promise((resolve) => {
    const u = new Unsplash({ accessKey: process.env.UNSPLASH_ACCESS_KEY })

    u.collections
      .getCollectionPhotos(parseInt(id.toString()))
      .then(toJson)
      .then((json) => {
        res.setHeader('Cache-Control', 'max-age=180000')
        res.status(200).json(json)
        resolve()
      })
      .catch((error) => {
        res.status(405).json(error)
        resolve()
      })
  })
}
