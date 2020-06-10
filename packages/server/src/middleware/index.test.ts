import {apiResolver} from 'next/dist/next-server/server/api-utils'
import http from 'http'
import listen from 'test-listen'
import fetch from 'isomorphic-unfetch'

import {BlitzApiRequest, BlitzApiResponse, Middleware} from '@blitzjs/core'
import {runMiddleware, compose} from '.'

describe('runMiddleware', () => {
  it('works without await', async () => {
    const middleware: Middleware[] = [
      async (_req, res, next) => {
        res.status(201)
        next()
      },
      async (_req, res, next) => {
        res.setHeader('test', 'works')
        res.json({a: 'b'})
        next()
      },
    ]

    await mockServer(middleware, async (url) => {
      const res = await fetch(url)
      expect(res.status).toBe(201)
      expect(res.headers.get('test')).toBe('works')
    })
  })

  it('works with await', async () => {
    const middleware: Middleware[] = [
      async (_req, res, next) => {
        res.status(201)
        await next()
      },
      async (_req, res, next) => {
        await next()
        res.setHeader('test', 'works')
      },
    ]

    await mockServer(middleware, async (url) => {
      const res = await fetch(url)
      expect(res.status).toBe(201)
      expect(res.headers.get('test')).toBe('works')
    })
  })

  it('works with flipped order', async () => {
    const middleware: Middleware[] = [
      async (_req, res, next) => {
        await next()
        res.setHeader('test', 'works')
      },
      async (_req, res, next) => {
        res.status(201)
        await next()
      },
    ]

    await mockServer(middleware, async (url) => {
      const res = await fetch(url)
      expect(res.status).toBe(201)
      expect(res.headers.get('test')).toBe('works')
    })
  })

  it('can short circuit request by not calling next', async () => {
    const middleware: Middleware[] = [
      async (_req, res, _next) => {
        res.status(201)
      },
      async (_req, _res, _next) => {
        throw new Error('This middleware should never run')
      },
    ]

    await mockServer(middleware, async (url) => {
      const res = await fetch(url)
      expect(res.status).toBe(201)
    })
  })

  it('middleware can throw', async () => {
    console.error = jest.fn()
    const middleware: Middleware[] = [
      async (_req, _res, _next) => {
        throw new Error('test')
      },
    ]

    await mockServer(middleware, async (url) => {
      const res = await fetch(url)
      expect(res.status).toBe(500)
    })
  })

  it('middleware can return error', async () => {
    const middleware: Middleware[] = [
      async (_req, _res, next) => {
        next(new Error('test'))
      },
      async (_req, _res, _next) => {
        throw new Error('Remaining middleware should not run if previous has error')
      },
    ]

    await mockServer(middleware, async (url) => {
      const res = await fetch(url)
      expect(res.status).toBe(500)
    })
  })
})

async function mockServer(middleware: Middleware[], callback: (url: string) => Promise<void>) {
  const apiEndpoint = async (req: BlitzApiRequest, res: BlitzApiResponse) => {
    await runMiddleware(req, res, compose(middleware))
    if (!res.writableEnded) {
      res.end()
    }
  }

  let server = http.createServer((req, res) =>
    apiResolver(req, res, null, apiEndpoint, {
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
