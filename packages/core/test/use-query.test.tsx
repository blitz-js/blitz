import React from 'react'
import {render, screen} from '@testing-library/react'
import {useQuery} from '../src/use-query'

describe('useQuery', () => {
  const mockQuery = async (args: string): Promise<string> => {
    return args.toUpperCase()
  }

  const setupHook = (params: any, queryFn = mockQuery): any[] => {
    let res: any[] = []
    function TestHarness() {
      res.concat(useQuery(queryFn, params))
      return <>Ready</>
    }
    render(
      <React.Suspense fallback="Loading...">
        <TestHarness />
      </React.Suspense>,
    )
    return [res]
  }

  it('should work', async () => {
    const [res] = setupHook('test')
    await screen.findByText('Ready')
    expect(res).toBe('TEST')
  })

  it('should work on dependent query', async () => {
    // TODO: make this actually dependent when I get the fundamentals working
    const [res] = setupHook(() => 'test')
    await screen.findByText('Ready')
    expect(res).toBe('TEST')
  })
})
