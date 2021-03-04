/* eslint @typescript-eslint/no-floating-promises: off */
import {act} from "@testing-library/react-hooks"
import {renderHook} from "../../test/test-utils"
import {useSession} from "./auth-client"
import {publicDataStore} from "./public-data-store"

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
      publicDataStore.updateState({roles: ["foo"], userId: "bar"} as any)
    })

    expect(result.current).toEqual({
      isLoading: false,
      userId: "bar",
      roles: ["foo"],
    })

    act(() => {
      publicDataStore.updateState({roles: ["baz"], userId: "boo"} as any)
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
      publicDataStore.updateState({roles: ["foo"], userId: "bar"} as any)
    })

    act(() => {
      unmount()
    })

    act(() => {
      publicDataStore.updateState({roles: ["baz"], userId: "boo"} as any)
    })

    expect(result.current).toEqual({
      isLoading: false,
      userId: "bar",
      roles: ["foo"],
    })
  })
})
