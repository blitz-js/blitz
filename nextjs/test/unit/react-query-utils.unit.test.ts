/**
 * @jest-environment jsdom
 */
import { queryClient, invalidateQuery, setQueryData } from 'next/data-client'

import { getQueryCacheFunctions } from 'next/dist/data-client/react-query-utils'
import { buildQueryRpc } from '../blitz-test-utils'

jest.mock('react-query')

// eslint-disable-next-line require-await
const isEmpty = async (arg: string): Promise<boolean> => {
  return Boolean(arg)
}

describe('getQueryCacheFunctions', () => {
  const spyRefetchQueries = jest.spyOn(queryClient, 'invalidateQueries')

  beforeEach(() => spyRefetchQueries.mockReset())

  it('returns a setQueryData function with working options', async () => {
    window.requestIdleCallback = jest.fn((fn) => {
      fn({} as any)
    }) as any

    const { setQueryData } = getQueryCacheFunctions(buildQueryRpc(isEmpty), 'a')
    expect(setQueryData).toBeTruthy()
    await setQueryData(true)
    expect(spyRefetchQueries).toBeCalledTimes(1)
    await setQueryData(true, { refetch: false })
    expect(spyRefetchQueries).toBeCalledTimes(1)
    await setQueryData(true, { refetch: true })
    expect(spyRefetchQueries).toBeCalledTimes(2)
  })

  it('works even when requestIdleCallback is undefined', async () => {
    window.requestIdleCallback = undefined as any
    const { setQueryData } = getQueryCacheFunctions(buildQueryRpc(isEmpty), 'a')
    expect(setQueryData).toBeTruthy()
    await setQueryData(true)
    expect(spyRefetchQueries).toBeCalledTimes(1)
    await setQueryData(true, { refetch: false })
    expect(spyRefetchQueries).toBeCalledTimes(1)
    await setQueryData(true, { refetch: true })
    expect(spyRefetchQueries).toBeCalledTimes(2)
  })
})

describe('invalidateQuery', () => {
  const spyRefetchQueries = jest.spyOn(queryClient, 'invalidateQueries')

  beforeEach(() => spyRefetchQueries.mockReset())

  it('invalidates a query given resolver and params', async () => {
    await invalidateQuery(buildQueryRpc(isEmpty), 'a')
    expect(spyRefetchQueries).toBeCalledTimes(1)
    const calledWith = spyRefetchQueries.mock.calls[0][0] as any
    // json of the queryKey is "a"
    expect(calledWith[1].json).toEqual('a')
  })
})

describe('setQueryData', () => {
  const spyRefetchQueries = jest.spyOn(queryClient, 'invalidateQueries')
  const spySetQueryData = jest.spyOn(queryClient, 'setQueryData')

  beforeEach(() => {
    spyRefetchQueries.mockReset()
    spySetQueryData.mockReset()
  })

  it('without refetch will not invalidate queries', async () => {
    await setQueryData(buildQueryRpc(isEmpty), 'params', 'newValue', {
      refetch: false,
    })
    expect(spyRefetchQueries).toBeCalledTimes(0)
    expect(spySetQueryData).toBeCalledTimes(1)

    const calledWith = spySetQueryData.mock.calls[0] as Array<any>
    expect(calledWith[0][1].json).toEqual('params')
    expect(calledWith[1]).toEqual('newValue')
  })

  it('will invalidate queries by default', async () => {
    await setQueryData(buildQueryRpc(isEmpty), 'params', 'newValue')
    expect(spyRefetchQueries).toBeCalledTimes(1)
    expect(spySetQueryData).toBeCalledTimes(1)

    const invalidateCalledWith = spyRefetchQueries.mock.calls[0][0] as any
    expect(invalidateCalledWith[1].json).toEqual('params')

    const calledWith = spySetQueryData.mock.calls[0] as Array<any>
    expect(calledWith[0][1].json).toEqual('params')
    expect(calledWith[1]).toEqual('newValue')
  })
})
