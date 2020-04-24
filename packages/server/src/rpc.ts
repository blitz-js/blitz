import {BlitzApiRequest, BlitzApiResponse} from '@blitzjs/core'
import {log} from './log'
import {serializeError} from 'serialize-error'

export function rpcHandler(
  type: string,
  name: string,
  resolver: (...args: any) => Promise<any>,
  connectDb?: () => any,
) {
  return async function (req: BlitzApiRequest, res: BlitzApiResponse) {
    const logPrefix = `${name} ${type}`
    if (req.method === 'POST') {
      log.progress(`Running ${logPrefix} ${JSON.stringify(req.body)} `)
    }

    if (req.method === 'HEAD') {
      // Warm the lamda and connect to DB
      if (typeof connectDb === 'function') {
        connectDb()
      }
      return res.status(200).end()
    } else if (req.method === 'POST') {
      // Handle RPC call

      if (typeof req.body.params === 'undefined') {
        const error = {message: 'Request body is missing the `params` key'}
        log.error(`${logPrefix} failed: ${JSON.stringify(error)}`)
        return res.status(400).json({
          result: null,
          error,
        })
      }

      try {
        const result = await resolver(req.body.params)

        log.success(`${logPrefix} returned ${log.variable(JSON.stringify(result))}`)
        return res.json({
          result,
          error: null,
        })
      } catch (error) {
        log.error(`${logPrefix} failed unexpectedly: ${error}`)
        return res.json({
          result: null,
          error: serializeError(error),
        })
      }
    } else {
      // Everything else is error
      log.error(`${logPrefix} not found`)
      return res.status(404).end()
    }
  }
}
