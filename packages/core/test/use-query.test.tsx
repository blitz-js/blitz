import React from 'react'
import {act, render, waitForElementToBeRemoved, screen} from '@testing-library/react'
import {useQuery} from '../src/use-query'

describe('useQuery', () => {
  const setupHook = (params: any, queryFn: (...args: any) => Promise<any>): [{data?: any}, Function] => {
    // This enhance fn does what getIsomorphicRpcHandler does during build time
    const enhance = (fn: any) => {
      fn._meta = {
        name: 'testResolver',
        type: 'query',
        path: 'app/test',
        apiUrl: 'test/url',
      }
      return fn
    }
    let res = {}
    function TestHarness() {
      useQuery(
        enhance((num: number) => num),
        1,
      )
      const [data] = useQuery(enhance(queryFn), params)
      Object.assign(res, {data})
      return <div id="harness">{data ? 'Ready' : 'Missing Dependency'}</div>
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
    it('should work', async () => {
      const [res] = setupHook('test', upcase)
      await waitForElementToBeRemoved(() => screen.getByText('Loading...'))
      await act(async () => {
        await screen.findByText('Ready')
        expect(res.data).toBe('TEST')
      })
    })

    it('should work on dependent query', async () => {
      // dependent queries are canceled if the params function throws
      let params: Function = () => {
        throw new Error('not ready yet')
      }

      const [res, rerender] = setupHook(() => params(), upcase)
      await screen.findByText('Missing Dependency')

      // eslint-disable-next-line require-await
      await act(async () => {
        // simulates the dependency becoming available
        params = () => 'test'
        rerender()
      })

      await act(async () => {
        await screen.findByText('Ready')
        expect(res.data).toBe('TEST')
      })
    })
  })
})
