/**
 * @jest-environment jsdom
 */
import React from 'react'
import { useMutation } from 'next/data-client'
import {
  act,
  render,
  screen,
  buildQueryRpc,
  buildMutationRpc,
} from '../blitz-test-utils'

beforeAll(() => {
  process.env.__BLITZ_SESSION_COOKIE_PREFIX = 'blitz-test'
})
afterAll(() => {
  jest.clearAllMocks()
  process.env.__BLITZ_SESSION_COOKIE_PREFIX = undefined
})

describe('useMutation', () => {
  const setupHook = (
    resolver: (...args: any) => Promise<any>
  ): [{ mutate?: Function }, Function] => {
    let res = {}
    function TestHarness() {
      const [mutate, { isSuccess }] = useMutation(resolver)
      Object.assign(res, { mutate })
      return <div id="harness">{isSuccess ? 'Sent' : 'Waiting'}</div>
    }

    const ui = () => <TestHarness />

    const { rerender } = render(ui())
    return [res, () => rerender(ui())]
  }

  describe('useMutation calls the resolver with the argument', () => {
    // eslint-disable-next-line require-await
    const mutateFn = jest.fn()
    it('should work with Blitz mutations', async () => {
      const [res] = setupHook(buildMutationRpc(mutateFn))
      await act(async () => {
        await res.mutate!('data')
        await screen.findByText('Sent')
        expect(mutateFn).toHaveBeenCalledTimes(1)
        expect(mutateFn).toHaveBeenCalledWith('data', { fromQueryHook: true })
      })
    })

    it("shouldn't work with regular functions", () => {
      console.error = jest.fn()
      expect(() => setupHook(mutateFn)).toThrowErrorMatchingSnapshot()
    })

    it("shouldn't work with query function", () => {
      console.error = jest.fn()
      const mutationFn = jest.fn()

      expect(() =>
        setupHook(buildQueryRpc(mutationFn))
      ).toThrowErrorMatchingSnapshot()
    })
  })
})
