import http from 'http'
import fetch from 'isomorphic-unfetch'
import listen from 'test-listen'
import {apiResolver} from 'next/dist/next-server/server/api-utils'
import {Middleware, connectMiddleware} from '@blitzjs/core'
import delay from 'delay'
import {rpcApiHandler} from '../src/rpc'

describe('rpcMiddleware', () => {
  describe('HEAD', () => {
    it('warms the endpoint', async () => {
      expect.assertions(1)
      await mockServer({}, async (url) => {
        const res = await fetch(url, {method: 'HEAD'})
        expect(res.status).toBe(200)
      })
    })
  })

  describe('POST', () => {
    it('handles missing params', async () => {
      console.error = jest.fn()
      await mockServer({}, async (url) => {
        const res = await fetch(url, {
          method: 'POST',
        })

        const data = await res.json()

        expect(res.status).toBe(400)
        expect(data.error.message).toBe('Request body is missing the `params` key')
      })
    })

    it('handles incorrect method', async () => {
      await mockServer({}, async (url) => {
        const res = await fetch(url, {
          method: 'GET',
        })

        expect(res.status).toBe(404)
      })
    })

    it('executes the request', async () => {
      console.log = jest.fn()
      const resolverFn = jest.fn().mockImplementation(async () => {
        await delay(1)
        return 'test'
      })

      let blitzResult: any

      await mockServer(
        {
          resolverFn,
          middleware: [
            connectMiddleware((_req, _res, next) => {
              next()
            }),
            async (_req, res, next) => {
              await next()
              blitzResult = res.blitzResult
            },
          ],
        },
        async (url) => {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({params: {}}),
          })

          const data = await res.json()

          expect(res.status).toBe(200)
          expect(data.result).toBe('test')
          expect(blitzResult).toBe('test')
        },
      )
    })

    it('handles errors from middleware and aborts execution', async () => {
      console.log = jest.fn()
      const resolverFn = jest.fn()

      await mockServer(
        {
          resolverFn,
          middleware: [
            (_req, _res, _next) => {
              throw new Error('hack')
            },
          ],
        },
        async (url) => {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({params: {}}),
          })

          expect(resolverFn).toHaveBeenCalledTimes(0)
          expect(res.status).toBe(500)
        },
      )
    })

    it('handles a query error', async () => {
      console.log = jest.fn()
      console.error = jest.fn()
      const resolverFn = jest.fn().mockImplementation(async () => {
        await delay(1)
        throw new Error('something broke')
      })

      await mockServer({resolverFn}, async (url) => {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({params: {}}),
        })

        const data = await res.json()

        expect(res.status).toBe(200)
        expect(data.error.message).toBe('something broke')
      })
    })
  })

  /**
   * Utility function to set up a mock http server to host the RPC endpoint
   * @param callback Callback provides the URL to the http server
   * @param resolverFn The query/mutation function
   * @param connectFn The DB connection function
   */
  async function mockServer(
    {
      resolverFn = jest.fn(),
      dbConnectorFn = jest.fn(),
      middleware,
    }: {resolverFn?: (...args: any) => any; dbConnectorFn?: (...args: any) => any; middleware?: Middleware[]},
    callback: (url: string) => Promise<void>,
  ) {
    const handler = rpcApiHandler('', 'server/test/rpc.test.ts', resolverFn, middleware, dbConnectorFn)

    ;(handler as any).config = {
      api: {
        externalResolver: true,
      },
    }

    let server = http.createServer(async (req, res) => {
      await apiResolver(req, res, null, handler, {
        previewModeId: 'previewModeId',
        previewModeEncryptionKey: 'previewModeEncryptionKey',
        previewModeSigningKey: 'previewModeSigningKey',
      })
    })

    try {
      let url = await listen(server)

      await callback(url)
    } finally {
      server.close()
    }
  }
})
