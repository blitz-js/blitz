import {getQueryCacheFunctions} from "../src/utils/react-query-utils"
import {queryCache} from "react-query"
import {enhanceQueryFn} from "./test-utils"

jest.mock("react-query")

// eslint-disable-next-line require-await
const isEmpty = async (arg: string): Promise<boolean> => {
  return Boolean(arg)
}

describe("getQueryCacheFunctions", () => {
  const spyRefetchQueries = jest.spyOn(queryCache, "invalidateQueries")

  beforeEach(() => spyRefetchQueries.mockReset())

  it("returns a setQueryData function with working options", async () => {
    window.requestIdleCallback = jest.fn((fn) => {
      fn({} as any)
    })

    const {setQueryData} = getQueryCacheFunctions(enhanceQueryFn(isEmpty), "a")
    expect(setQueryData).toBeTruthy()
    await setQueryData(true)
    expect(spyRefetchQueries).toBeCalledTimes(1)
    await setQueryData(true, {refetch: false})
    expect(spyRefetchQueries).toBeCalledTimes(1)
    await setQueryData(true, {refetch: true})
    expect(spyRefetchQueries).toBeCalledTimes(2)
  })

  it("works even when requestIdleCallback is undefined", async () => {
    window.requestIdleCallback = undefined as any
    const {setQueryData} = getQueryCacheFunctions(enhanceQueryFn(isEmpty), "a")
    expect(setQueryData).toBeTruthy()
    await setQueryData(true)
    expect(spyRefetchQueries).toBeCalledTimes(1)
    await setQueryData(true, {refetch: false})
    expect(spyRefetchQueries).toBeCalledTimes(1)
    await setQueryData(true, {refetch: true})
    expect(spyRefetchQueries).toBeCalledTimes(2)
  })
})
