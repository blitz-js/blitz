import http from 'http'
import { apiResolver } from 'next/dist/next-server/server/api-utils'
import {
  handleRequestWithMiddleware,
  secureProxyMiddleware,
} from 'next/dist/next-server/server/middleware'
import fetch from 'node-fetch'
import listen from 'test-listen'
import { NextApiHandler, Middleware } from 'next/types'
import { Request } from 'express'
import { Socket } from 'net'

describe('secure proxy middleware', () => {
  // @ts-ignore
  let reqSecure: Request = {
    connection: new Socket(),
    method: 'GET',
    url: '/stuff?q=thing',
    headers: {
      'x-forwarded-proto': 'https',
    },
  }
  // @ts-ignore
  let reqHttp: Request = {
    connection: new Socket(),
    method: 'GET',
    url: '/stuff?q=thing',
    headers: {
      'x-forwarded-proto': 'http',
    },
  }
  // @ts-ignore
  let reqNoHeader: Request = {
    connection: new Socket(),
    method: 'GET',
    url: '/stuff?q=thing',
  }

  const res = {}
  it('should set https protocol if X-Forwarded-Proto is https', () => {
    // @ts-ignore
    void secureProxyMiddleware(reqSecure, res, () => null)
    expect(reqSecure.protocol).toEqual('https')
  })

  it('should set http protocol if X-Forwarded-Proto is absent', () => {
    // @ts-ignore
    void secureProxyMiddleware(reqNoHeader, res, () => null)
    expect(reqNoHeader.protocol).toEqual('http')
  })

  it('should set http protocol if X-Forwarded-Proto is http', () => {
    // @ts-ignore
    void secureProxyMiddleware(reqHttp, res, () => null)
    expect(reqHttp.protocol).toEqual('http')
  })
})

describe('handleRequestWithMiddleware', () => {
  it('works without await', async () => {
    const middleware: Middleware[] = [
      (_req, res, next) => {
        res.status(201)
        return next()
      },
      (_req, res, next) => {
        res.setHeader('test', 'works')
        res.json({ a: 'b' })
        return next()
      },
    ]

    await mockServer(middleware, async (url) => {
      const res = await fetch(url, { method: 'POST' })
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
      const res = await fetch(url, { method: 'POST' })
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
      const res = await fetch(url, { method: 'POST' })
      expect(res.status).toBe(201)
      expect(res.headers.get('test')).toBe('works')
    })
  })

  it('middleware can throw', async () => {
    console.log = jest.fn()
    console.error = jest.fn()
    const forbiddenMiddleware = jest.fn()
    const middleware: Middleware[] = [
      (_req, _res, _next) => {
        throw new Error('test')
      },
      forbiddenMiddleware,
    ]

    await mockServer(middleware, async (url) => {
      const res = await fetch(url, { method: 'POST' })
      expect(forbiddenMiddleware).not.toBeCalled()
      expect(res.status).toBe(500)
    })
  }, 30000)

  // Failing on windows for unknown reason
  it('middleware can return error', async () => {
    console.log = jest.fn()
    const forbiddenMiddleware = jest.fn()
    const middleware: Middleware[] = [
      (_req, _res, next) => {
        return next(new Error('test'))
      },
      forbiddenMiddleware,
    ]

    await mockServer(middleware, async (url) => {
      const res = await fetch(url, { method: 'POST' })
      expect(forbiddenMiddleware).not.toBeCalled()
      expect(res.status).toBe(500)
    })
  })
})

async function mockServer(
  middleware: Middleware[],
  callback: (url: string) => Promise<void>
) {
  const apiEndpoint: NextApiHandler<any> = async (req, res) => {
    try {
      await handleRequestWithMiddleware(req, res, middleware, {
        stackPrintOnError: false,
      })
    } catch (err) {
      res.status(500)
    } finally {
      res.end()
    }
    return
  }

  let server = http.createServer((req, res) =>
    apiResolver(
      req,
      res,
      null,
      apiEndpoint,
      {
        previewModeId: 'previewModeId',
        previewModeEncryptionKey: 'previewModeEncryptionKey',
        previewModeSigningKey: 'previewModeSigningKey',
      },
      false,
      {} as any
    )
  )

  try {
    let url = await listen(server)
    await callback(url)
  } finally {
    server.close()
  }
}
