import {serialize} from "superjson"
import {getBlitzRuntimeData} from "../src/blitz-data"
import {executeRpcCall, getIsomorphicEnhancedResolver} from "./rpc-client"

declare global {
  namespace NodeJS {
    interface Global {
      fetch: any
    }
  }
}

global.fetch = jest.fn(() => Promise.resolve({ok: true, json: () => ({result: null, error: null})}))
window.__BLITZ_DATA__ = getBlitzRuntimeData()

describe("RPC", () => {
  describe("HEAD", () => {
    it("warms the endpoint", async () => {
      expect.assertions(1)
      await executeRpcCall.warm("/api/endpoint")
      expect(global.fetch).toBeCalled()
    })
  })

  describe("POST", () => {
    it("makes the request", async () => {
      expect.assertions(2)
      const fetchMock = jest
        .spyOn(global, "fetch")
        .mockImplementationOnce(() =>
          Promise.resolve({ok: true, json: () => ({result: "result", error: null})}),
        )

      const resolverModule = {
        default: jest.fn(),
      }
      const rpcFn = getIsomorphicEnhancedResolver(
        resolverModule,
        "app/_resolvers/queries/getProduct",
        "testResolver",
        "query",
        "client",
      )

      try {
        const result = await rpcFn({paramOne: 1234}, {fromQueryHook: true})
        expect(result).toBe("result")
        expect(fetchMock).toBeCalled()
      } finally {
        fetchMock.mockRestore()
      }
    })

    it("handles errors", async () => {
      expect.assertions(1)
      const error = new Error("something broke")
      const serializedError = serialize(error)
      const fetchMock = jest.spyOn(global, "fetch").mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => ({
            result: null,
            error: serializedError.json,
            meta: {
              error: serializedError.meta,
            },
          }),
        }),
      )

      const resolverModule = {
        default: jest.fn(),
      }
      const rpcFn = getIsomorphicEnhancedResolver(
        resolverModule,
        "app/_resolvers/queries/getProduct",
        "testResolver",
        "query",
        "client",
      )

      try {
        await expect(rpcFn({paramOne: 1234}, {fromQueryHook: true})).rejects.toThrowError(
          /something broke/,
        )
      } finally {
        fetchMock.mockRestore()
      }
    })
  })
})
