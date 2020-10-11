import http, {IncomingMessage, ServerResponse} from "http"
import listen from "test-listen"
import fetch from "isomorphic-unfetch"
import delay from "delay"

import {invokeWithMiddleware} from "./invoke"
import {EnhancedResolver} from "./types"

describe("invokeWithMiddleware", () => {
  it("works without middleware", async () => {
    console.log = jest.fn()
    const resolverModule = (jest.fn().mockImplementation(async (input) => {
      await delay(1)
      return input
    }) as unknown) as EnhancedResolver<unknown, unknown>
    resolverModule._meta = {
      name: "getTest",
      type: "query",
      filePath: "some/test/path",
      apiUrl: "some/test/path",
    }

    await mockServer(
      async (req, res) => {
        const result = await invokeWithMiddleware(resolverModule as any, "test", {req, res})

        expect(result).toBe("test")
      },
      async (url) => {
        const res = await fetch(url)
        expect(res.status).toBe(200)
      },
    )
  }, 30000)

  it("works with middleware", async () => {
    console.log = jest.fn()
    const resolverModule = (jest.fn().mockImplementation(async (input) => {
      await delay(1)
      return input
    }) as unknown) as EnhancedResolver<unknown, unknown>
    resolverModule._meta = {
      name: "getTest",
      type: "query",
      filePath: "some/test/path",
      apiUrl: "some/test/path",
    }
    resolverModule.middleware = [
      (_req, res, next) => {
        res.statusCode = 201
        return next()
      },
      (_req, res, next) => {
        res.setHeader("test", "works")
        return next()
      },
    ]

    await mockServer(
      async (req, res) => {
        const result = await invokeWithMiddleware(resolverModule as any, "test", {req, res})

        expect(result).toBe("test")
      },
      async (url) => {
        const res = await fetch(url)
        expect(res.status).toBe(201)
        expect(res.headers.get("test")).toBe("works")
      },
    )
  })

  it("works with extra middleware in config", async () => {
    console.log = jest.fn()
    const resolverModule = (jest.fn().mockImplementation(async (input) => {
      await delay(1)
      return input
    }) as unknown) as EnhancedResolver<unknown, unknown>
    resolverModule._meta = {
      name: "getTest",
      type: "query",
      filePath: "some/test/path",
      apiUrl: "some/test/path",
    }
    resolverModule.middleware = [
      (_req, res, next) => {
        res.statusCode = 201
        return next()
      },
    ]

    await mockServer(
      async (req, res) => {
        const result = await invokeWithMiddleware(resolverModule as any, "test", {
          req,
          res,
          middleware: [
            (_req, res, next) => {
              res.setHeader("test", "works")
              return next()
            },
          ],
        })

        expect(result).toBe("test")
      },
      async (url) => {
        const res = await fetch(url)
        expect(res.status).toBe(201)
        expect(res.headers.get("test")).toBe("works")
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
