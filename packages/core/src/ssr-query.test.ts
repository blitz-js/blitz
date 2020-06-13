import http, {IncomingMessage, ServerResponse} from 'http'
import listen from 'test-listen'
import fetch from 'isomorphic-unfetch'
import delay from 'delay'

import {ssrQuery} from './ssr-query'
import {EnhancedResolverModule} from './rpc'

describe('ssrQuery', () => {
  it('works without middleware', async () => {
    const resolverModule: EnhancedResolverModule = {
      default: jest.fn().mockImplementation(async (input) => {
        await delay(1)
        return input
      }),
      name: 'getTest',
      type: 'query',
      path: 'some/test/path',
      cacheKey: 'some/test/path',
    }

    await mockServer(
      async (req, res) => {
        const result = await ssrQuery(resolverModule as any, 'test', {req, res})

        expect(result).toBe('test')
      },
      async (url) => {
        const res = await fetch(url)
        expect(res.status).toBe(200)
      },
    )
  })

  it('works with middleware', async () => {
    const resolverModule: EnhancedResolverModule = {
      default: jest.fn().mockImplementation(async (input) => {
        await delay(1)
        return input
      }),
      name: 'getTest',
      type: 'query',
      path: 'some/test/path',
      cacheKey: 'some/test/path',
      middleware: [
        (_req, res, next) => {
          res.statusCode = 201
          return next()
        },
        (_req, res, next) => {
          res.setHeader('test', 'works')
          return next()
        },
      ],
    }

    await mockServer(
      async (req, res) => {
        const result = await ssrQuery(resolverModule as any, 'test', {req, res})

        expect(result).toBe('test')
      },
      async (url) => {
        const res = await fetch(url)
        expect(res.status).toBe(201)
        expect(res.headers.get('test')).toBe('works')
      },
    )
  })
})

async function mockServer(
  handler: (req: IncomingMessage, res: ServerResponse) => Promise<void>,
  callback: (url: string) => Promise<void>,
) {
  let server = http.createServer(async (req, res) => {
    await handler(req, res)
    res.end()
  })

  try {
    let url = await listen(server)
    await callback(url)
  } finally {
    server.close()
  }
}
