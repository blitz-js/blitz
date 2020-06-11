import http from 'http'
import fetch from 'isomorphic-unfetch'
import listen from 'test-listen'
import {apiResolver} from 'next/dist/next-server/server/api-utils'
import {Middleware} from '@blitzjs/core'
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
      // console.log = jest.fn()
      const resolverFn = jest.fn().mockImplementation(() => 'test')

      await mockServer(
        {
          resolverFn,
          middleware: [
            (_req, _res, next) => {
              return next()
            },
            async (_req, res, next) => {
              await next()
              expect(res.blitzResult).toBe('test')
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

          expect(data.result).toBe('test')
          expect(res.status).toBe(200)
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

    it.skip('handles thrown error from post middleware', async () => {
      // console.log = jest.fn()
      const resolverFn = jest.fn().mockImplementation(() => 'test')

      await mockServer(
        {
          resolverFn,
          middleware: [
            async (_req, _res, next) => {
              await next()
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
          console.log('res', res.ok)
          console.log('res', res.status)
          console.log('res', res.statusText)

          expect(res.status).toBe(500)
          expect(resolverFn).toHaveBeenCalledTimes(1)
        },
      )
    })

    it('handles a query error', async () => {
      console.log = jest.fn()
      console.error = jest.fn()
      const resolverFn = jest.fn().mockImplementation(() => {
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
      console.log('after apiResolver', res.statusCode)
    })

    try {
      let url = await listen(server)

      await callback(url)
    } finally {
      server.close()
    }
  }
})
