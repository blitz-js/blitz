import {describe, expect, it, vi} from "vitest"
import superJson from "superjson"

import {getQueryKey, getQueryKeyFromUrlAndParams, validateQueryFn} from "./utils"
import {RpcClient} from "../index-server"

const API_ENDPOINT = "http://localhost:3000"

const constructData = (arg: any) => {
  return {
    data: arg,
    expected: superJson.serialize(arg),
  }
}

describe("react-query-utils", () => {
  describe("getQueryKeyFromUrlAndParams", () => {
    it("returns a query key with string arg", () => {
      const {data, expected} = constructData("RandomString")
      expect(getQueryKeyFromUrlAndParams(API_ENDPOINT, data)).toEqual([API_ENDPOINT, expected])
    })

    it("returns a query key with object arg", () => {
      const {data, expected} = constructData({id: 1, name: "test", field: undefined})
      expect(getQueryKeyFromUrlAndParams(API_ENDPOINT, data)).toEqual([API_ENDPOINT, expected])
    })

    it("returns a query key with undefined arg", () => {
      const {data, expected} = constructData(undefined)
      expect(getQueryKeyFromUrlAndParams(API_ENDPOINT, data)).toEqual([API_ENDPOINT, expected])
    })

    it("returns a query key with null arg", () => {
      const {data, expected} = constructData(null)
      expect(getQueryKeyFromUrlAndParams(API_ENDPOINT, data)).toEqual([API_ENDPOINT, expected])
    })

    it("if no argument is passed it returns only url", () => {
      const queryKey = getQueryKeyFromUrlAndParams(API_ENDPOINT)
      expect(queryKey).toEqual([API_ENDPOINT])
    })
  })

  describe("getQueryKey", () => {
    // @ts-expect-error - we just need these 3 params
    const query: RpcClient<{}, null> = {
      _resolverName: "randomQuery",
      _resolverType: "query",
      _routePath: API_ENDPOINT,
    }

    it("returns a query key with string arg", () => {
      const {data, expected} = constructData("RandomString")
      expect(getQueryKey(query, data)).toEqual([API_ENDPOINT, expected])
    })

    it("returns a query key with object arg", () => {
      const {data, expected} = constructData({id: 1, name: "test", field: undefined})
      expect(getQueryKey(query, data)).toEqual([API_ENDPOINT, expected])
    })

    it("returns a query key with undefined arg", () => {
      const {data, expected} = constructData(undefined)
      expect(getQueryKey(query, data)).toEqual([API_ENDPOINT, expected])
    })

    it("returns a query key with null arg", () => {
      const {data, expected} = constructData(null)
      expect(getQueryKey(query, data)).toEqual([API_ENDPOINT, expected])
    })

    it("if no argument is passed it returns only url", () => {
      const queryKey = getQueryKey(query)
      expect(queryKey).toEqual([API_ENDPOINT])
    })
  })

  describe("validateQueryFn", () => {
    const originalEnv = process.env

    function mockEnv() {
      const originalEnv = process.env

      process.env = {
        ...originalEnv,
      }

      delete process.env.JEST_WORKER_ID
      delete process.env.VITEST_WORKER_ID
      delete process.env.BLITZ_TEST_ENVIRONMENT

      return process.env
    }

    function restoreEnv() {
      process.env = originalEnv
    }

    const notAQuery = vi.fn()
    const realQuery = vi.fn()
    //@ts-ignore
    realQuery._isRpcClient = true

    vi.mock("blitz", async () => {
      const actualBlitz = await import("blitz")
      return {
        ...actualBlitz,
        isClient: true,
      }
    })

    describe("when called from test environments", () => {
      it("always validate as true, allowing query functions to be mocked in tests")
      const jestEnv = mockEnv()
      jestEnv.JEST_WORKER_ID = "123"
      expect(() => validateQueryFn(notAQuery)).not.toThrowError()
      expect(() => validateQueryFn(realQuery)).not.toThrowError()
      restoreEnv()

      const vitestEnv = mockEnv()
      vitestEnv.VITEST_WORKER_ID = "123"
      expect(() => validateQueryFn(notAQuery)).not.toThrowError()
      expect(() => validateQueryFn(realQuery)).not.toThrowError()
      restoreEnv()
    })

    describe("when called from outside of test environments", () => {
      it("throws an error when the passed function is not a query function")
      // removes jest and vitest env vars
      mockEnv()

      expect(() => validateQueryFn(notAQuery)).toThrowError()
      expect(() => validateQueryFn(realQuery)).not.toThrowError()

      restoreEnv()
    })
  })
})
