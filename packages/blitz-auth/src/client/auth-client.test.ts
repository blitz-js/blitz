/**
 * @vitest-environment jsdom
 */

import {vi, expect, describe, it, beforeAll, afterAll, spyOn, SpyInstance} from "vitest"
import {parsePublicDataToken, getPublicDataStore, useSession} from "./index"
import {COOKIE_PUBLIC_DATA_TOKEN} from "../shared"
import {toBase64} from "b64-lite"
import {act} from "@testing-library/react"
import {renderHook} from "@testing-library/react-hooks"

vi.mock("blitz", async () => {
  const blitz = await vi.importActual("blitz")
  //@ts-ignore
  return {...blitz}
})

import * as stdlib from "blitz"

beforeAll(() => {
  globalThis.__BLITZ_SESSION_COOKIE_PREFIX = "blitz-test"
})
afterAll(() => {
  globalThis.__BLITZ_SESSION_COOKIE_PREFIX = undefined
})

describe("parsePublicDataToken", () => {
  it("throws if token is empty", () => {
    const ret = () => parsePublicDataToken("")
    expect(ret).toThrow("[parsePublicDataToken] Failed: token is empty")
  })

  it("throws if the token cannot be parsed", () => {
    const invalidJSON = "{"
    const ret = () => parsePublicDataToken(toBase64(invalidJSON))

    expect(ret).toThrowError("[parsePublicDataToken] Failed to parse publicDataStr: {")
  })

  it("parses the public data", () => {
    const validJSON = '{"foo": "bar"}'
    expect(parsePublicDataToken(toBase64(validJSON))).toEqual({
      publicData: {foo: "bar"},
    })
  })

  it("parses the public data containing unicode chars", () => {
    const data = '"foo-κόσμε-żółć-平仮名"'
    expect(parsePublicDataToken(toBase64(data))).toEqual({
      publicData: "foo-κόσμε-żółć-平仮名",
    })
  })
})

describe("publicDataStore", () => {
  it("calls readCookie token on init", () => {
    const spy = spyOn(stdlib, "readCookie")
    getPublicDataStore()
    expect(spy).toHaveBeenCalledWith(COOKIE_PUBLIC_DATA_TOKEN())
    spy.mockRestore()
  })

  describe("updateState", () => {
    let localStorageSpy: SpyInstance

    beforeAll(() => {
      localStorageSpy = spyOn(Storage.prototype, "setItem")
    })

    it("sets local storage", () => {
      getPublicDataStore().updateState()
      expect(localStorageSpy).toBeCalledTimes(1)
    })

    it("publishes data on observable", () => {
      let ret: any = null
      getPublicDataStore().observable.subscribe((data) => {
        ret = data
      })
      getPublicDataStore().updateState()
      expect(ret).not.toEqual(null)
    })
  })

  describe("clear", () => {
    it("clears the cookie", () => {
      const spy = spyOn(stdlib, "deleteCookie")
      getPublicDataStore().clear()
      expect(spy).toHaveBeenCalledWith(COOKIE_PUBLIC_DATA_TOKEN())
    })
    it("clears the cache", () => {
      getPublicDataStore().clear()
    })

    it("publishes empty data", () => {
      let ret: any = null
      getPublicDataStore().observable.subscribe((data) => {
        ret = data
      })
      getPublicDataStore().clear()
      expect(ret).toEqual({userId: null, role: null})
    })
  })

  describe("getData", () => {
    describe("when the cookie is falsy", () => {
      it("returns empty data if cookie is falsy", () => {
        const ret = getPublicDataStore().getData()

        expect(ret).toEqual({userId: null, role: null})
      })
    })
  })
})

describe("useSession", () => {
  it("returns empty at when no value is set", () => {
    const {result} = renderHook(() => useSession())

    expect(result.current).toEqual({
      role: null,
      isLoading: false,
      userId: null,
    })
  })

  it("subscribes to the public data store", () => {
    const {result} = renderHook(() => useSession())

    act(() => {
      getPublicDataStore().updateState({roles: ["foo"], userId: "bar"} as any)
    })

    expect(result.current).toEqual({
      isLoading: false,
      userId: "bar",
      roles: ["foo"],
    })

    act(() => {
      getPublicDataStore().updateState({roles: ["baz"], userId: "boo"} as any)
    })

    expect(result.current).toEqual({
      isLoading: false,
      userId: "boo",
      roles: ["baz"],
    })
  })

  it("un-subscribes from the public data store on unmount", () => {
    const {result, unmount} = renderHook(() => useSession())

    act(() => {
      getPublicDataStore().updateState({roles: ["foo"], userId: "bar"} as any)
    })

    act(() => {
      unmount()
    })

    act(() => {
      getPublicDataStore().updateState({roles: ["baz"], userId: "boo"} as any)
    })

    expect(result.current).toEqual({
      isLoading: false,
      userId: "bar",
      roles: ["foo"],
    })
  })
})
