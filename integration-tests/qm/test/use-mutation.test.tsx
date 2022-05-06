import {describe, it, expect, beforeAll, vi} from "vitest"
import {screen, act} from "@testing-library/react"
import {useMutation} from "@blitzjs/rpc"
import React from "react"
import {buildMutationRpc, render} from "../blitz-test-utils"

beforeAll(() => {
  globalThis.__BLITZ_SESSION_COOKIE_PREFIX = "qm-test-cookie-prefix"
})

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
    const mutateFn = vi.fn()
    it("should work with Blitz mutations", async () => {
      const [res] = setupHook(buildMutationRpc(mutateFn))

      await act(async () => {
        await res.mutate!("data")
        await screen.findByText("Sent")
        expect(mutateFn).toHaveBeenCalledTimes(1)
        expect(mutateFn).toHaveBeenCalledWith("data", {fromQueryHook: true})
      })
    })
  })
})
