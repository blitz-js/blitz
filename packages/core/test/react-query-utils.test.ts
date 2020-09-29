import {getQueryCacheFunctions} from "../src/utils/react-query-utils"
import {queryCache} from "react-query"

jest.mock("react-query")

describe("getQueryCacheFunctions", () => {
  it("returns a mutate function with working options", async () => {
    window.requestIdleCallback = jest.fn((fn) => {
      fn({} as any)
    })
    const spyRefetchQueries = jest.spyOn(queryCache, "invalidateQueries")
    const {mutate} = getQueryCacheFunctions("testQueryKey")
    expect(mutate).toBeTruthy()
    await mutate({newData: true})
    expect(spyRefetchQueries).toBeCalledTimes(1)
    await mutate({newData: true}, {refetch: false})
    expect(spyRefetchQueries).toBeCalledTimes(1)
    await mutate({newData: true}, {refetch: true})
    expect(spyRefetchQueries).toBeCalledTimes(2)
  })
})
