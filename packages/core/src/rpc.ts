import {BlitzApiRequest, BlitzApiResponse} from '@blitzjs/core'
import {serializeError, deserializeError} from 'serialize-error'

export async function rpc(url: string, params: any) {
  const result = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    body: JSON.stringify({params}),
  })

  const json = await result.json()

  if (json.result) {
    return json.result
  } else {
    throw deserializeError(json.error)
  }
}

export function rpcHandler(
  type: string,
  name: string,
  resolver: (...args: any) => Promise<any>,
  connectDb?: () => any,
) {
  return async function(req: BlitzApiRequest, res: BlitzApiResponse) {
    const logPrefix = `[${type}:${name}]`
    console.log(`${logPrefix} ${req.method} ${JSON.stringify(req.body)} `)

    if (req.method === 'HEAD') {
      // Warm the lamda and connect to DB
      if (typeof connectDb === 'function') {
        connectDb()
      }
      console.log(`${logPrefix} SUCCESS 200`)
      return res.status(200).end()
    } else if (req.method === 'POST') {
      // Handle RPC call

      if (typeof req.body.params === 'undefined') {
        const error = {message: "Request body is missing the 'params' key"}
        console.log(`${logPrefix} ERROR: ${JSON.stringify(error)}`)
        return res.status(400).json({
          result: null,
          error,
        })
      }

      try {
        const result = await resolver(req.body.params)

        console.log(`${logPrefix} SUCCESS ${JSON.stringify(result)}`)
        return res.json({
          result,
          error: null,
        })
      } catch (error) {
        console.log(`${logPrefix} ERROR: ${error}`)
        return res.json({
          result: null,
          error: serializeError(error),
        })
      }
    } else {
      // Everything else is error
      console.log(`${logPrefix} ERROR: 404`)
      return res.status(404).end()
    }
  }
}
