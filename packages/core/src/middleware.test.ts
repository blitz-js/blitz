import http from "http"
import {apiResolver} from "next/dist/next-server/server/api-utils"
import fetch from "node-fetch"
import listen from "test-listen"
import {BlitzApiRequest, BlitzApiResponse} from "."
import {handleRequestWithMiddleware} from "./middleware"
import {Middleware} from "./types"

describe("handleRequestWithMiddleware", () => {
  it("works without await", async () => {
    const middleware: Middleware[] = [
      (_req, res, next) => {
        res.status(201)
        return next()
      },
      (_req, res, next) => {
        res.setHeader("test", "works")
        res.json({a: "b"})
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
        res.status(201)
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
        res.status(201)
        await next()
      },
    ]

    await mockServer(middleware, async (url) => {
      const res = await fetch(url, {method: "POST"})
      expect(res.status).toBe(201)
      expect(res.headers.get("test")).toBe("works")
    })
  })

  // Failing on windows for unknown reason
  it("middleware can throw", async () => {
    console.log = jest.fn()
    console.error = jest.fn()
    const forbiddenMiddleware = jest.fn()
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
    console.log = jest.fn()
    const forbiddenMiddleware = jest.fn()
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
  const apiEndpoint = async (req: BlitzApiRequest, res: BlitzApiResponse) => {
    try {
      await handleRequestWithMiddleware(req, res, middleware, {stackPrintOnError: false})
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
        previewModeId: "previewModeId",
        previewModeEncryptionKey: "previewModeEncryptionKey",
        previewModeSigningKey: "previewModeSigningKey",
      },
      false,
    ),
  )

  try {
    let url = await listen(server)
    await callback(url)
  } finally {
    server.close()
  }
}
