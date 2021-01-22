/* eslint @typescript-eslint/no-floating-promises: off */
import {act} from "@testing-library/react-hooks"
import {toBase64} from "b64-lite"
import {renderHook} from "../../test/test-utils"
import {publicDataStore} from "../public-data-store"
import {useSession} from "../supertokens"
import {parsePublicDataToken} from "./tokens"

describe("supertokens", () => {
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

  describe("useSession", () => {
    it("returns empty at when no value is set", () => {
      const {result} = renderHook(() => useSession())

      expect(result.current).toEqual({
        isLoading: false,
        ...publicDataStore.emptyPublicData,
      })
    })

    it("subscribes to the public data store", () => {
      const {result} = renderHook(() => useSession())

      act(() => {
        publicDataStore.updateState({roles: ["foo"], userId: "bar"})
      })

      expect(result.current).toEqual({
        isLoading: false,
        roles: ["foo"],
        userId: "bar",
      })

      act(() => {
        publicDataStore.updateState({roles: ["baz"], userId: "boo"})
      })

      expect(result.current).toEqual({
        isLoading: false,
        roles: ["baz"],
        userId: "boo",
      })
    })

    it("un-subscribes from the public data store on unmount", () => {
      const {result, unmount} = renderHook(() => useSession())

      act(() => {
        publicDataStore.updateState({roles: ["foo"], userId: "bar"})
      })

      act(() => {
        unmount()
      })

      act(() => {
        publicDataStore.updateState({roles: ["baz"], userId: "boo"})
      })

      expect(result.current).toEqual({
        isLoading: false,
        roles: ["foo"],
        userId: "bar",
      })
    })
  })
})
