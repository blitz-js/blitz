import {getQueryCacheFunctions} from "../src/utils/query-cache"
import {queryCache} from "react-query"

jest.mock("react-query")

describe("getQueryCacheFunctions", () => {
  it("returns a mutate function with working options", () => {
    const spyRefetchQueries = jest.spyOn(queryCache, "refetchQueries")
    const {mutate} = getQueryCacheFunctions("testQueryKey")
    expect(mutate).toBeTruthy()
    mutate({newData: true})
    expect(spyRefetchQueries).toBeCalledTimes(1)
    mutate({newData: true}, {refetch: false})
    expect(spyRefetchQueries).toBeCalledTimes(1)
    mutate({newData: true}, {refetch: true})
    expect(spyRefetchQueries).toBeCalledTimes(2)
  })
})
