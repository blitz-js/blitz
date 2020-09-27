import React from "react"
import {act, render, waitForElementToBeRemoved, screen} from "./test-utils"
import {useQuery} from "../src/use-query-hooks"
import {deserialize} from "superjson"

describe("useQuery", () => {
  const setupHook = (
    params: any,
    queryFn: (...args: any) => Promise<any>,
  ): [{data?: any}, Function] => {
    // This enhance fn does what getIsomorphicEnhancedResolver does during build time
    const enhance = (fn: any) => {
      const newFn = (...args: any) => {
        const [data, ...rest] = args
        return fn(deserialize(data), ...rest)
      }
      newFn._meta = {
        name: "testResolver",
        type: "query",
        path: "app/test",
        apiUrl: "test/url",
      }
      return newFn
    }
    let res = {}
    function TestHarness() {
      useQuery(
        enhance((num: number) => num),
        1,
      )
      const [data] = useQuery(enhance(queryFn), params)
      Object.assign(res, {data})
      return <div id="harness">{data ? "Ready" : "Missing Dependency"}</div>
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
    it("should work", async () => {
      const [res] = setupHook("test", upcase)
      await waitForElementToBeRemoved(() => screen.getByText("Loading..."))
      await act(async () => {
        await screen.findByText("Ready")
        expect(res.data).toBe("TEST")
      })
    })
  })
})
