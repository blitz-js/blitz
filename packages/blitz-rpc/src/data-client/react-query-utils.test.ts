import {describe, expect, it} from "vitest"
import superJson from "superjson"

import {getQueryKey, getQueryKeyFromUrlAndParams} from "./react-query-utils"
import {RpcClient} from "./rpc"

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
})
