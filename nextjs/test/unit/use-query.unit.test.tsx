/**
 * @jest-environment jsdom
 */
import React from 'react'
import delay from 'delay'
import { useInfiniteQuery, useQuery, queryClient } from 'next/data-client'
import {
  act,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  buildQueryRpc,
  buildMutationRpc,
} from '../blitz-test-utils'

beforeAll(() => {
  queryClient.clear()
  process.env.__BLITZ_SESSION_COOKIE_PREFIX = 'blitz-test'
  process.env.__BLITZ_SUSPENSE_ENABLED = 'true'
})
afterAll(() => {
  jest.clearAllMocks()
  process.env.__BLITZ_SESSION_COOKIE_PREFIX = undefined
  process.env.__BLITZ_SUSPENSE_ENABLED = undefined
})

describe('useQuery', () => {
  const setupHook = (
    params: any,
    queryFn: (...args: any) => any,
    options: Parameters<typeof useQuery>[2] = {} as any
  ): [{ data?: any; setQueryData?: any }, Function] => {
    let res = {}
    function TestHarness() {
      const [data, { setQueryData }] = useQuery(queryFn, params, {
        suspense: true,
        ...options,
      } as any)
      Object.assign(res, { data, setQueryData })
      return (
        <div id="harness">
          <span>{data ? 'Ready' : 'No data'}</span>
          <span>{data}</span>
        </div>
      )
    }

    const ui = () => (
      <React.Suspense fallback="Loading...">
        <TestHarness />
      </React.Suspense>
    )

    const { rerender } = render(ui())
    return [res, () => rerender(ui())]
  }

  describe('a "query" that converts the string parameter to uppercase', () => {
    const upcase = async (args: string) => {
      await delay(1000)
      return args.toUpperCase()
    }
    it('should work with Blitz queries', async () => {
      const [res] = setupHook('test', buildQueryRpc(upcase))
      await waitForElementToBeRemoved(() => screen.getByText('Loading...'))
      await act(async () => {
        await screen.findByText('Ready')
        expect(res.data).toBe('TEST')
      })
    })

    it('should be able to change the data with setQueryData', async () => {
      const [res] = setupHook('test', buildQueryRpc(upcase))
      await waitForElementToBeRemoved(() => screen.getByText('Loading...'))
      await act(async () => {
        await screen.findByText('Ready')
        expect(res.data).toBe('TEST')
        res.setQueryData((p: string) => p.substr(1, 2), { refetch: false })
        await waitFor(() => screen.getByText('ES'))
      })
    })

    it("shouldn't work with regular functions", () => {
      console.error = jest.fn()
      expect(() => setupHook('test', upcase)).toThrowErrorMatchingSnapshot()
    })

    it("shouldn't work with mutation function", () => {
      console.error = jest.fn()
      expect(() =>
        setupHook('test', buildMutationRpc(upcase))
      ).toThrowErrorMatchingSnapshot()
    })

    it('suspense disabled if enabled is false', async () => {
      setupHook('test', buildQueryRpc(upcase), { enabled: false })
      await screen.findByText('No data')
    })

    it('suspense disabled if enabled is null', async () => {
      setupHook('test', buildQueryRpc(upcase), { enabled: null })
      await screen.findByText('No data')
    })

    it('suspense disabled if enabled is false and suspense set', async () => {
      setupHook('test', buildQueryRpc(upcase), {
        enabled: false,
        suspense: true,
      })
      await screen.findByText('No data')
    })
  })

  // it("works with options other than enabled & suspense without type error", () => {
  //   const queryFn = ((() => true) as unknown) as () => Promise<boolean>
  //   useQuery(queryFn, undefined, {refetchInterval: 10000})
  // })
})

describe('useInfiniteQuery', () => {
  const setupHook = (
    params: (arg?: any) => any,
    queryFn: (...args: any) => any
  ): [{ data?: any; setQueryData?: any }, Function] => {
    let res = {}
    function TestHarness() {
      // TODO - fix typing
      //@ts-ignore
      const [groupedData] = useInfiniteQuery(queryFn, params, {
        suspense: true,
        getNextPageParam: () => {},
      })
      Object.assign(res, { groupedData })
      return (
        <div id="harness">
          <span>{groupedData ? 'Ready' : 'No data'}</span>
          <div>
            {groupedData.map((data: any, i) => (
              <div key={i}>{data}</div>
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

    const { rerender } = render(ui())
    return [res, () => rerender(ui())]
  }

  const getItems = ({ id }: { id: number }) => {
    if (id === 1) {
      return 'item1'
    } else if (id === 2) {
      return 'item2'
    } else {
      throw new Error('No item for this id')
    }
  }
  it('should work', async () => {
    setupHook(() => ({ id: 1 }), buildQueryRpc(getItems))
    await waitForElementToBeRemoved(() => screen.getByText('Loading...'))
    await act(async () => {
      await screen.findByText('item1')
    })

    setupHook(() => ({ id: 2 }), buildQueryRpc(getItems))
    await act(async () => {
      await screen.findByText('item2')
    })
  })
})
