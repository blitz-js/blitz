import React from "react"
import {act, render, screen} from "./test-utils"
import {useMutation} from "../src/use-mutation"

// This enhance fn does what getIsomorphicEnhancedResolver does during build time
const enhance = (fn: any) => {
  const newFn = (...args: any) => fn(...args)
  newFn._meta = {
    name: "testResolver",
    type: "mutation",
    path: "app/test",
    apiUrl: "test/url",
  }
  return newFn
}

describe("useMutation", () => {
  const setupHook = (resolver: (...args: any) => Promise<any>): [{mutate?: Function}, Function] => {
    let res = {}
    function TestHarness() {
      const [mutate, {isSuccess}] = useMutation(resolver)
      Object.assign(res, {mutate})
      return <div id="harness">{isSuccess ? "Sent" : "Waiting"}</div>
    }

    const ui = () => <TestHarness />

    const {rerender} = render(ui())
    return [res, () => rerender(ui())]
  }

  describe("useMutation calls the resolver with the argument", () => {
    // eslint-disable-next-line require-await
    const mutateFn = jest.fn()
    it("should work with Blitz mutations", async () => {
      const [res] = setupHook(enhance(mutateFn))
      await act(async () => {
        await res.mutate!("data")
        await screen.findByText("Sent")
        expect(mutateFn).toHaveBeenCalledTimes(1)
        expect(mutateFn).toHaveBeenCalledWith("data", {fromQueryHook: true})
      })
    })

    it("shouldn't work with regular functions", () => {
      expect(() => setupHook(mutateFn)).toThrowErrorMatchingSnapshot()
    })
  })
})
