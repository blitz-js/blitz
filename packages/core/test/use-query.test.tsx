import React from "react"
import {getBlitzRuntimeData} from "../src/blitz-data"
import {useInfiniteQuery, useQuery} from "../src/use-query-hooks"
import {queryClient} from "../src/utils/react-query-utils"
import {act, render, screen, waitFor, waitForElementToBeRemoved} from "./test-utils"
import {enhanceMutationFn, enhanceQueryFn} from "./test-utils"

beforeEach(() => {
  queryClient.clear()
})

window.__BLITZ_DATA__ = getBlitzRuntimeData()
window["DEBUG_BLITZ"] = 1

describe("useQuery", () => {
  const setupHook = (
    params: any,
    queryFn: (...args: any) => any,
    options: Parameters<typeof useQuery>[2] = {} as any,
  ): [{data?: any; setQueryData?: any}, Function] => {
    let res = {}
    function TestHarness() {
      const [data, {setQueryData}] = useQuery(queryFn, params, options as any)
      Object.assign(res, {data, setQueryData})
      return (
        <div id="harness">
          <span>{data ? "Ready" : "No data"}</span>
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
    const upcase = (args: string) => {
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

    it("shouldn't work with mutation function", () => {
      console.error = jest.fn()
      expect(() => setupHook("test", enhanceMutationFn(upcase))).toThrowErrorMatchingSnapshot()
    })

    it("suspense disabled if enabled is false", async () => {
      setupHook("test", enhanceQueryFn(upcase), {enabled: false})
      await screen.findByText("No data")
    })

    it("suspense disabled if enabled is null", async () => {
      setupHook("test", enhanceQueryFn(upcase), {enabled: null})
      await screen.findByText("No data")
    })

    it("suspense disabled if enabled is false and suspense set", async () => {
      setupHook("test", enhanceQueryFn(upcase), {enabled: false, suspense: true})
      await screen.findByText("No data")
    })
  })

  // it("works with options other than enabled & suspense without type error", () => {
  //   const queryFn = ((() => true) as unknown) as () => Promise<boolean>
  //   useQuery(queryFn, undefined, {refetchInterval: 10000})
  // })
})

describe("useInfiniteQuery", () => {
  const setupHook = (
    params: (arg?: any) => any,
    queryFn: (...args: any) => any,
  ): [{data?: any; setQueryData?: any}, Function] => {
    let res = {}
    function TestHarness() {
      // TODO - fix typing
      //@ts-ignore
      const [groupedData] = useInfiniteQuery(queryFn, params, {getNextPageParam: () => {}})
      Object.assign(res, {groupedData})
      return (
        <div id="harness">
          <span>{groupedData ? "Ready" : "No data"}</span>
          <div>
            {groupedData.map((data: any) => (
              <div>{data}</div>
            ))}
          </div>
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

  const getItems = ({id}: {id: number}) => {
    if (id === 1) {
      return "item1"
    } else if (id === 2) {
      return "item2"
    } else {
      throw new Error("No item for this id")
    }
  }
  it("should work", async () => {
    setupHook(() => ({id: 1}), enhanceQueryFn(getItems))
    await waitForElementToBeRemoved(() => screen.getByText("Loading..."))
    await act(async () => {
      await screen.findByText("item1")
    })

    setupHook(() => ({id: 2}), enhanceQueryFn(getItems))
    await act(async () => {
      await screen.findByText("item2")
    })
  })
})
