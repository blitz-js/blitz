import {BlitzApiRequest, BlitzApiResponse} from '@blitzjs/core'
import {log} from './log'
import {serializeError} from 'serialize-error'

export function rpcHandler(
  _: string,
  name: string,
  resolver: (...args: any) => Promise<any>,
  connectDb?: () => any,
) {
  return async function (req: BlitzApiRequest, res: BlitzApiResponse) {
    const logPrefix = `${name}`

    if (req.method === 'HEAD') {
      // Warm the lamda and connect to DB
      if (typeof connectDb === 'function') {
        connectDb()
      }
      return res.status(200).end()
    } else if (req.method === 'POST') {
      // Handle RPC call
      console.log('') // New line
      log.progress(`Running ${logPrefix}(${JSON.stringify(req.body?.params, null, 2)})`)

      if (typeof req.body.params === 'undefined') {
        const error = {message: 'Request body is missing the `params` key'}
        log.error(`${logPrefix} failed: ${JSON.stringify(error)}\n`)
        return res.status(400).json({
          result: null,
          error,
        })
      }

      try {
        const result = await resolver(req.body.params)

        log.success(`${logPrefix} returned ${log.variable(JSON.stringify(result, null, 2))}\n`)
        return res.json({
          result,
          error: null,
        })
      } catch (error) {
        log.error(`${logPrefix} failed: ${error}\n`)
        return res.json({
          result: null,
          error: serializeError(error),
        })
      }
    } else {
      // Everything else is error
      log.error(`${logPrefix} not found\n`)
      return res.status(404).end()
    }
  }
}
