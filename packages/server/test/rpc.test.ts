import http from 'http'
import fetch from 'isomorphic-unfetch'
import listen from 'test-listen'
import {apiResolver} from 'next/dist/next-server/server/api-utils'
import {connectMiddleware, EnhancedResolverModule} from '@blitzjs/core'
import delay from 'delay'
import {rpcApiHandler} from '../src/rpc'

describe('rpcMiddleware', () => {
  describe('HEAD', () => {
    it('warms the endpoint', async () => {
      expect.assertions(1)
      const resolverModule = (jest.fn() as unknown) as EnhancedResolverModule
      resolverModule._meta = {
        name: 'testResolver',
        type: 'query',
        path: 'test/path',
        apiUrl: 'testurl',
      }
      await mockServer(resolverModule, async (url) => {
        const res = await fetch(url, {method: 'HEAD'})
        expect(res.status).toBe(200)
      })
    })
  })

  describe('POST', () => {
    it('handles missing params', async () => {
      console.error = jest.fn()

      const resolverModule = (jest.fn() as unknown) as EnhancedResolverModule
      resolverModule._meta = {
        name: 'testResolver',
        type: 'query',
        path: 'test/path',
        apiUrl: 'testurl',
      }
      await mockServer(resolverModule, async (url) => {
        const res = await fetch(url, {
          method: 'POST',
        })

        const data = await res.json()

        expect(res.status).toBe(400)
        expect(data.error.message).toBe('Request body is missing the `params` key')
      })
    })

    it('handles incorrect method', async () => {
      const resolverModule = (jest.fn() as unknown) as EnhancedResolverModule
      resolverModule._meta = {
        name: 'testResolver',
        type: 'query',
        path: 'test/path',
        apiUrl: 'testurl',
      }
      await mockServer(resolverModule, async (url) => {
        const res = await fetch(url, {
          method: 'GET',
        })

        expect(res.status).toBe(404)
      })
    })

    it('executes the request', async () => {
      console.log = jest.fn()

      const resolverModule = (jest.fn().mockImplementation(async () => {
        await delay(1)
        return 'test'
      }) as unknown) as EnhancedResolverModule
      resolverModule._meta = {
        name: 'testResolver',
        type: 'query',
        path: 'test/path',
        apiUrl: 'testurl',
      }
      resolverModule.middleware = [
        connectMiddleware((_req, _res, next) => {
          next()
        }),
        async (_req, res, next) => {
          await next()
          blitzResult = res.blitzResult
        },
      ]

      let blitzResult: any

      await mockServer(resolverModule, async (url) => {
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
      })
    })

    it('handles errors from middleware and aborts execution', async () => {
      console.log = jest.fn()

      const resolverModule = (jest.fn() as unknown) as EnhancedResolverModule
      resolverModule._meta = {
        name: 'testResolver',
        type: 'query',
        path: 'test/path',
        apiUrl: 'testurl',
      }
      resolverModule.middleware = [
        (_req, _res, _next) => {
          throw new Error('hack')
        },
      ]
      await mockServer(resolverModule, async (url) => {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({params: {}}),
        })

        expect(resolverModule).toHaveBeenCalledTimes(0)
        expect(res.status).toBe(500)
      })
    })

    it('handles a query error', async () => {
      console.log = jest.fn()
      console.error = jest.fn()

      const resolverModule = (jest.fn().mockImplementation(async () => {
        await delay(1)
        throw new Error('something broke')
      }) as unknown) as EnhancedResolverModule
      resolverModule._meta = {
        name: 'testResolver',
        type: 'query',
        path: 'test/path',
        apiUrl: 'testurl',
      }

      await mockServer(resolverModule, async (url) => {
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
    resolverModule: EnhancedResolverModule,
    callback: (url: string) => Promise<void>,
  ) {
    const dbConnectorFn = undefined
    const handler = rpcApiHandler(resolverModule, resolverModule.middleware, dbConnectorFn)

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
