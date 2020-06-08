import {apiResolver} from 'next/dist/next-server/server/api-utils'
import http from 'http'
import listen from 'test-listen'
import fetch from 'isomorphic-unfetch'

import {BlitzApiRequest, BlitzApiResponse} from '@blitzjs/core'
import {runMiddleware, compose, Middleware} from '.'

describe('runMiddleware', () => {
  it('works', async () => {
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
    res.end()
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
