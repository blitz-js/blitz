import {BlitzApiRequest, BlitzApiResponse} from '@blitzjs/core'
import createProduct from 'app/products/mutations/createProduct'
import {serializeError} from 'serialize-error'
import db from 'prisma'

export default async function(req: BlitzApiRequest, res: BlitzApiResponse) {
  console.log(`[blitz] createProduct ${req.method} ${JSON.stringify(req.body)} `)
  if (req.method === 'HEAD') {
    // Warm the lamda and connect to DB
    db.connect()
    return res.status(200).end()
  } else if (req.method === 'POST') {
    // Handle RPC call

    if (!req.body.params) {
      return res.status(400).json({
        result: null,
        error: {message: "Request body is missing the 'params' key"},
      })
    }

    try {
      const result = await createProduct(req.body.params)

      console.log(`[blitz] createProduct SUCCESS `)
      return res.json({
        result,
        error: null,
      })
    } catch (error) {
      console.log(`[blitz] createProduct ERROR: ${error}`)
      return res.json({
        result: null,
        error: serializeError(error),
      })
    }
  } else {
    // Everything else is error
    return res.status(404).end()
  }
}
