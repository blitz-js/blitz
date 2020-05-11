import React from 'react'
import {act, render, screen} from '@testing-library/react'
import {useQuery} from '../src/use-query'

describe('useQuery', () => {
  const mockQuery = async (args: string): Promise<string> => {
    return args.toUpperCase()
  }

  const setupHook = (params: any, queryFn = mockQuery): {data?: any} => {
    let res = {}
    function TestHarness() {
      useQuery(async (num: number) => num, 1)
      const [data] = useQuery(queryFn, params)
      Object.assign(res, {data})
      return data ? <>Ready</> : <>Loading...</>
    }
    render(
      <React.Suspense fallback="Loading...">
        <TestHarness />
      </React.Suspense>,
    )
    return res
  }

  it('should work', async () => {
    const res = setupHook('test')
    await act(async () => {
      await screen.findByText('Ready')
      expect(res.data).toBe('TEST')
    })
  })

  it('should work on dependent query', async () => {
    // TODO: make this actually dependent when I get the fundamentals working
    const res = setupHook(() => 'test')
    await act(async () => {
      await screen.findByText('Ready')
      expect(res.data).toBe('TEST')
    })
  })
})
