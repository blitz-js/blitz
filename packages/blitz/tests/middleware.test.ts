import {describe, it, expect, vi} from "vitest"
import {createServer, IncomingMessage, ServerResponse} from "http"
import fetch from "node-fetch"
import listen from "test-listen"
import {Stream} from "stream"
import {Middleware} from "../src/index-server"
import {handleRequestWithMiddleware} from "../src/middleware"

export function sendData(res: ServerResponse, body: any): void {
  if (body === null || body === undefined) {
    res.end()
    return
  }

  const contentType = res.getHeader("Content-Type")

  if (body instanceof Stream) {
    if (!contentType) {
      res.setHeader("Content-Type", "application/octet-stream")
    }
    body.pipe(res)
    return
  }

  const isJSONLike = ["object", "number", "boolean"].includes(typeof body)
  const stringifiedBody = isJSONLike ? JSON.stringify(body) : body

  if (Buffer.isBuffer(body)) {
    if (!contentType) {
      res.setHeader("Content-Type", "application/octet-stream")
    }
    res.setHeader("Content-Length", body.length)
    res.end(body)
    return
  }

  if (isJSONLike) {
    res.setHeader("Content-Type", "application/json; charset=utf-8")
  }

  res.setHeader("Content-Length", Buffer.byteLength(stringifiedBody))
  res.end(stringifiedBody)
}

export function sendJson(res: ServerResponse, jsonBody: any): void {
  // Set header to application/json
  res.setHeader("Content-Type", "application/json; charset=utf-8")
  // Use send to handle request
  sendData(res, jsonBody)
}

describe("handleRequestWithMiddleware", () => {
  it("works without await", async () => {
    const middleware: Middleware[] = [
      (_req, res, next) => {
        res.statusCode = 201
        return next()
      },
      (_req, res, next) => {
        res.setHeader("test", "works")
        sendJson(res, {a: "b"})
        return next()
      },
    ]

    await mockServer(middleware, async (url) => {
      const res = await fetch(url, {method: "POST"})
      expect(res.status).toBe(201)
      expect(res.headers.get("test")).toBe("works")
    })
  })

  it("works with await", async () => {
    const middleware: Middleware[] = [
      async (_req, res, next) => {
        res.statusCode = 201
        await next()
      },
      async (_req, res, next) => {
        await next()
        res.setHeader("test", "works")
      },
    ]

    await mockServer(middleware, async (url) => {
      const res = await fetch(url, {method: "POST"})
      expect(res.status).toBe(201)
      expect(res.headers.get("test")).toBe("works")
    })
  })

  it("works with flipped order", async () => {
    const middleware: Middleware[] = [
      async (_req, res, next) => {
        await next()
        res.setHeader("test", "works")
      },
      async (_req, res, next) => {
        res.statusCode = 201
        await next()
      },
    ]

    await mockServer(middleware, async (url) => {
      const res = await fetch(url, {method: "POST"})
      expect(res.status).toBe(201)
      expect(res.headers.get("test")).toBe("works")
    })
  })

  it("middleware can throw", async () => {
    console.log = vi.fn()
    console.error = vi.fn()
    const forbiddenMiddleware = vi.fn()
    const middleware: Middleware[] = [
      (_req, _res, _next) => {
        throw new Error("test")
      },
      forbiddenMiddleware,
    ]

    await mockServer(middleware, async (url) => {
      const res = await fetch(url, {method: "POST"})
      expect(forbiddenMiddleware).not.toBeCalled()
      expect(res.status).toBe(500)
    })
  }, 30000)

  // Failing on windows for unknown reason
  it("middleware can return error", async () => {
    console.log = vi.fn()
    const forbiddenMiddleware = vi.fn()
    const middleware: Middleware[] = [
      (_req, _res, next) => {
        return next(new Error("test"))
      },
      forbiddenMiddleware,
    ]

    await mockServer(middleware, async (url) => {
      const res = await fetch(url, {method: "POST"})
      expect(forbiddenMiddleware).not.toBeCalled()
      expect(res.status).toBe(500)
    })
  })
})

async function mockServer(middleware: Middleware[], callback: (url: string) => Promise<void>) {
  let server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    try {
      await handleRequestWithMiddleware(req, res, middleware, {
        stackPrintOnError: false,
      })
    } catch (err) {
      res.statusCode = 500
    } finally {
      res.end()
    }
    return
  })

  try {
    let url = await listen(server)
    await callback(url)
  } finally {
    server.close()
  }
}
