// process.env.__NEXT_ROUTER_BASEPATH is assigned to a variable in Next's router.ts,
// so it needs to get updated before that file gets imported.
const OLD_ENV = process.env
process.env = {...OLD_ENV, __NEXT_ROUTER_BASEPATH: "/base"}

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

describe("RPC with basePath", () => {
  beforeEach(() => {
    jest.resetModules()
  })

  afterAll(() => {
    process.env = OLD_ENV // Restore old environment
  })

  describe("HEAD", () => {
    it("warms the endpoint with correct basePath", async () => {
      expect.assertions(1)
      await executeRpcCall.warm("/api/endpoint")
      expect(global.fetch).toBeCalledWith("/base/api/endpoint", {method: "HEAD"})
    })
  })

  describe("POST", () => {
    it("makes the request with correct basePath", async () => {
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
        expect(fetchMock).toBeCalledWith(
          "/base/api/queries/getProduct",
          expect.objectContaining({
            body: '{"params":{"paramOne":1234},"meta":{}}',
            method: "POST",
          }),
        )
      } finally {
        fetchMock.mockRestore()
      }
    })
  })
})
