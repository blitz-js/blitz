import {TOKEN_SEPARATOR} from "../constants"
import {parsePublicDataToken} from "./tokens"
import {useSession} from "../supertokens"
import {renderHook} from "../../test/test-utils"
import {publicDataStore} from "../public-data-store"
import {act} from "@testing-library/react-hooks"

describe("supertokens", () => {
  describe("parsePublicDataToken", () => {
    it("throws if token is empty", () => {
      const ret = () => parsePublicDataToken("")
      expect(ret).toThrow("[parsePublicDataToken] Failed: token is empty")
    })

    it("throws if the token cannot be parsed", () => {
      const invalidJSON = "{"
      const ret = () => parsePublicDataToken(btoa(invalidJSON))

      expect(ret).toThrowError("[parsePublicDataToken] Failed to parse publicDataStr: {")
    })

    it("parses the public data", () => {
      const validJSON = '"foo"'
      expect(parsePublicDataToken(btoa(validJSON))).toEqual({
        publicData: "foo",
      })
    })

    it("only uses the first separated tokens", () => {
      const data = `"foo"${TOKEN_SEPARATOR}123`
      expect(parsePublicDataToken(btoa(data))).toEqual({
        publicData: "foo",
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

    it("subscribes to the public data store", async () => {
      const {result} = renderHook(() => useSession())

      await act(() => {
        publicDataStore.updateState({roles: ["foo"], userId: "bar"})
      })

      expect(result.current).toEqual({
        isLoading: false,
        roles: ["foo"],
        userId: "bar",
      })

      await act(() => {
        publicDataStore.updateState({roles: ["baz"], userId: "boo"})
      })

      expect(result.current).toEqual({
        isLoading: false,
        roles: ["baz"],
        userId: "boo",
      })
    })

    it("un-subscribes from the public data store on unmount", async () => {
      const {result, unmount} = renderHook(() => useSession())

      await act(() => {
        publicDataStore.updateState({roles: ["foo"], userId: "bar"})
      })

      await act(() => {
        unmount()
      })

      await act(() => {
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
