import {describe, it, expect, beforeAll, vi} from "vitest"
import {act, screen, waitForElementToBeRemoved, waitFor} from "@testing-library/react"
import {useQuery, useInfiniteQuery, BlitzRpcPlugin, QueryClientProvider} from "@blitzjs/rpc"
import React from "react"
import delay from "delay"
import {buildMutationRpc, buildQueryRpc, mockRouter, render} from "../../utils/blitz-test-utils"
import {RouterContext} from "next/dist/shared/lib/router-context"

beforeAll(() => {
  globalThis.__BLITZ_SESSION_COOKIE_PREFIX = "qm-test-cookie-prefix"
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
})

describe("useQuery", () => {
  const setupHook = (
    ID: string,
    params: any,
    queryFn: (...args: any) => any,
    options: Parameters<typeof useQuery>[2] = {} as any,
  ): [{data?: any; setQueryData?: any}, Function] => {
    let res = {}
    const qc = BlitzRpcPlugin({})

    function TestHarness() {
      const [data, {setQueryData}] = useQuery(queryFn, params, {
        suspense: true,
        ...options,
      } as any)

      Object.assign(res, {data, setQueryData})
      return (
        <div id={`harness-${ID}`}>
          <span>{data ? `Ready${ID}` : "No data"}</span>
          <span>{data}</span>
        </div>
      )
    }

    const ui = () => (
      <React.Suspense fallback="Loading...">
        <TestHarness />
      </React.Suspense>
    )

    const {rerender} = render(ui(), {
      wrapper: ({children}) => (
        <QueryClientProvider client={globalThis.queryClient}>
          <RouterContext.Provider value={mockRouter}>{children}</RouterContext.Provider>
        </QueryClientProvider>
      ),
    })
    return [res, () => rerender(ui())]
  }

  describe('a "query" that converts the string parameter to uppercase', () => {
    const upcase = async (args: string) => {
      await delay(500)
      return args.toUpperCase()
    }

    it("should work with Blitz queries", async () => {
      const [res] = setupHook("2", "test", buildQueryRpc(upcase))
      await waitForElementToBeRemoved(() => screen.getByText("Loading..."))
      await act(async () => {
        await screen.findByText("Ready2")
        expect(res.data).toBe("TEST")
      })
    })

    it("should be able to change the data with setQueryData", async () => {
      const [res] = setupHook("3", "fooBar", buildQueryRpc(upcase))
      await waitForElementToBeRemoved(() => screen.getByText("Loading..."))
      await act(async () => {
        await screen.findByText("Ready3")
        expect(res.data).toBe("FOOBAR")
        res.setQueryData((p: string) => p.substr(3, 3), {refetch: false})
        await delay(100)
      })

      expect(res.data).toBe("BAR")
    })

    it("shouldn't work with regular functions", () => {
      console.error = vi.fn()
      expect(() => setupHook("4", "test", upcase)).toThrowErrorMatchingSnapshot()
    })

    it("shouldn't work with mutation function", () => {
      console.error = vi.fn()
      expect(() => setupHook("5", "test", buildMutationRpc(upcase))).toThrowErrorMatchingSnapshot()
    })

    it("suspense disabled if enabled is false", async () => {
      setupHook("6", "test", buildQueryRpc(upcase), {enabled: false})
      await screen.findByText("No data")
    })

    it("suspense disabled if enabled is undefined", async () => {
      setupHook("7", "test", buildQueryRpc(upcase), {enabled: undefined})
      await screen.findByText("No data")
    })

    // it("suspense disabled if enabled is false and suspense set", async () => {
    //   setupHook("8", "test", buildQueryRpc(upcase), {
    //     enabled: false,
    //     suspense: true,
    //   })
    //   await screen.findByText("No data")
    // })

    it("works with options other than enabled & suspense without type error", () => {
      const Demo = () => {
        useQuery(buildQueryRpc(upcase), undefined, {refetchInterval: 10000})
        return <div></div>
      }
      const ui = () => <Demo />

      const {rerender} = render(ui(), {
        wrapper: ({children}) => (
          <QueryClientProvider client={globalThis.queryClient}>
            <RouterContext.Provider value={mockRouter}>{children}</RouterContext.Provider>
          </QueryClientProvider>
        ),
      })
    })
  })
})

describe("useInfiniteQuery", () => {
  const setupHook = (
    ID: string,
    params: (arg?: any) => any,
    queryFn: (...args: any) => any,
  ): [{data?: any; setQueryData?: any}, Function] => {
    let res = {}
    const qc = BlitzRpcPlugin({})

    function TestHarness() {
      // TODO - fix typing
      //@ts-ignore
      const [groupedData] = useInfiniteQuery(queryFn, params, {
        suspense: true,
        getNextPageParam: () => {},
      })
      Object.assign(res, {groupedData})
      return (
        <div id="harness">
          <span>{groupedData ? `Ready${ID}` : "No data"}</span>
          <div>
            {groupedData.map((data: any, i) => (
              <div key={i}>{data}</div>
            ))}
          </div>
        </div>
      )
    }

    const ui = () => (
      <React.Suspense fallback={`Loading${ID}...`}>
        <TestHarness />
      </React.Suspense>
    )

    const {rerender} = render(ui(), {
      wrapper: ({children}) => (
        <QueryClientProvider client={globalThis.queryClient}>
          <RouterContext.Provider value={mockRouter}>{children}</RouterContext.Provider>
        </QueryClientProvider>
      ),
    })
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
  it("should show loading", async () => {
    setupHook("1", () => ({id: 1}), buildQueryRpc(getItems))
    await waitForElementToBeRemoved(() => screen.getByText("Loading1..."))
    await act(async () => {
      await screen.findByText("item1")
    })
  })
})
