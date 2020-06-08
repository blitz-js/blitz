import http from 'http'
import fetch from 'isomorphic-unfetch'
import listen from 'test-listen'
import {apiResolver} from 'next/dist/next-server/server/api-utils'
import {rpcApiHandler} from '../src/rpc'
import {Middleware} from '../src/middleware'

// const customMiddleware: Middleware = async (req, res, next) => {
//   res.blitzCtx.referrer = req.headers.referer
//
//   await next()
//
//   console.log('Query result:', res.blitzResult)
// }

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
      const resolverFn = jest.fn().mockImplementation(() => 'test')

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
        expect(data.result).toBe('test')
      })
    })

    it('handles a query error', async () => {
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
    const handler = rpcApiHandler('', 'server/test/rpc.test.ts', resolverFn, dbConnectorFn, middleware)

    let server = http.createServer((req, res) =>
      apiResolver(req, res, null, handler, {
        previewModeId: 'previewModeId',
        previewModeEncryptionKey: 'previewModeEncryptionKey',
        previewModeSigningKey: 'previewModeSigningKey',
      }),
    )

    try {
      let url = await listen(server)

      await callback(url)
    } finally {
      server.close()
    }
  }
})
