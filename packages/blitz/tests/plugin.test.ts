import {describe, it, expect, vi} from "vitest"
import {ClientPlugin} from "../src/index-server"
import {reduceBlitzPlugins, merge, pipe} from "../src/plugin"

vi.spyOn(console, "log")

describe("merge", () => {
  it("should merge functions", async () => {
    const fn1 = async (x: number) => x + 1
    const fn2 = async (x: number) => x + 2
    const merged = merge([fn1, fn2])
    const results = await Promise.all(merged(1))
    expect(results).toEqual([2, 3])
  })
})

describe("pipe", () => {
  it("should pipe functions", async () => {
    const fn1 = (x: number) => x + 1
    const fn2 = (x: number) => x + 2
    const piped = pipe(fn1, fn2)
    expect(piped(1)).toEqual(4)
  })
})

describe("reduceBlitzPlugins", () => {
  it("should reduce plugins", async () => {
    const plugin1: ClientPlugin<{
      foo: number
    }> = {
      middleware: {
        beforeHttpRequest: (x) => {
          x.headers = {
            ...x.headers,
            "x-plugin1": "plugin1",
          }
          return x
        },
        beforeHttpResponse: (x) => {
          //@ts-expect-error - need this as this is not actually a Response
          expect(x.headers["x-plugin2"]).toEqual("plugin2")
          return x
        },
      },
      events: {
        onRpcError: async (x) => {
          if (x.message === "error from plugin2") {
            return
          }
          expect(x.message).toEqual("error from plugin1")
        },
        onSessionCreated: async () => {
          console.log("Session created from plugin1")
        },
      },
      exports: () => ({
        foo: 2,
      }),
    }
    const plugin2: ClientPlugin<{
      bar: number
    }> = {
      middleware: {
        beforeHttpRequest: (x) => {
          x.headers = {
            ...x.headers,
            "x-plugin2": "plugin2",
          }
          return x
        },
        beforeHttpResponse: (x) => {
          //@ts-expect-error - need this as this is not actually a Response
          expect(x.headers["x-plugin1"]).toEqual("plugin1")
          return x
        },
      },
      events: {
        onRpcError: async (x) => {
          if (x.message === "error from plugin1") {
            return
          }
          expect(x.message).toEqual("error from plugin2")
        },
        onSessionCreated: async () => {
          console.log("Session created from plugin2")
        },
      },
      exports: () => ({
        bar: 3,
      }),
    }
    const {middleware, events, exports} = reduceBlitzPlugins({plugins: [plugin1, plugin2]})
    expect(middleware.beforeHttpRequest).toBeDefined()
    expect(middleware.beforeHttpResponse).toBeDefined()
    expect(events.onRpcError).toBeDefined()
    expect(events.onSessionCreated).toBeDefined()
    expect(exports).toBeDefined()
    expect(exports.foo).toEqual(2)
    expect(exports.bar).toEqual(3)
    const request = {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }
    const modifiedRequest = middleware.beforeHttpRequest(request)
    const response: Response = {
      headers: modifiedRequest.headers as Headers,
      status: 200,
      statusText: "OK",
      body: null,
      bodyUsed: false,
      url: "",
      ok: true,
      redirected: false,
      type: "basic",
      clone: () => response,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      blob: () => Promise.resolve(new Blob()),
      formData: () => Promise.resolve(new FormData()),
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(""),
    }
    const modifiedResponse = middleware.beforeHttpResponse(response)
    await Promise.all(events.onRpcError(new Error("error from plugin1")))
    await Promise.all(events.onRpcError(new Error("error from plugin2")))
    await Promise.all(events.onSessionCreated())
    expect(console.log).toHaveBeenCalledWith("Session created from plugin1")
    expect(console.log).toHaveBeenCalledWith("Session created from plugin2")
  })
})
