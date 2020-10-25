import React from "react"
import {queryCache} from "react-query"
import {useQuery} from "../src/use-query-hooks"
import {act, render, screen, waitFor, waitForElementToBeRemoved} from "./test-utils"
import {enhanceQueryFn} from "./test-utils"

beforeEach(() => {
  queryCache.clear()
})

describe("useQuery", () => {
  const setupHook = (
    params: any,
    queryFn: (...args: any) => Promise<any>,
  ): [{data?: any; setQueryData?: any}, Function] => {
    let res = {}
    function TestHarness() {
      const [data, {setQueryData}] = useQuery(queryFn, params)
      Object.assign(res, {data, setQueryData})
      return (
        <div id="harness">
          <span>{data ? "Ready" : "Missing Dependency"}</span>
          <span>{data}</span>
        </div>
      )
    }

    const ui = () => (
      <React.Suspense fallback="Loading...">
        <TestHarness />
      </React.Suspense>
    )

    const {rerender} = render(ui())
    return [res, () => rerender(ui())]
  }

  describe('a "query" that converts the string parameter to uppercase', () => {
    // eslint-disable-next-line require-await
    const upcase = async (args: string): Promise<string> => {
      return args.toUpperCase()
    }
    it("should work with Blitz queries", async () => {
      const [res] = setupHook("test", enhanceQueryFn(upcase))
      await waitForElementToBeRemoved(() => screen.getByText("Loading..."))
      await act(async () => {
        await screen.findByText("Ready")
        expect(res.data).toBe("TEST")
      })
    })

    it("should be able to change the data with setQueryData", async () => {
      const [res] = setupHook("test", enhanceQueryFn(upcase))
      await waitForElementToBeRemoved(() => screen.getByText("Loading..."))
      await act(async () => {
        await screen.findByText("Ready")
        expect(res.data).toBe("TEST")
        res.setQueryData((p: string) => p.substr(1, 2), {refetch: false})
        await waitFor(() => screen.getByText("ES"))
      })
    })

    it("shouldn't work with regular functions", () => {
      console.error = jest.fn()
      expect(() => setupHook("test", upcase)).toThrowErrorMatchingSnapshot()
    })
  })
})
