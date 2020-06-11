import {executeRpcCall, getIsomorphicRpcHandler} from '@blitzjs/core'

global.fetch = jest.fn(() => Promise.resolve({json: () => ({result: null, error: null})}))

declare global {
  namespace NodeJS {
    interface Global {
      fetch: any
    }
  }
}

describe('RPC', () => {
  describe('HEAD', () => {
    it('warms the endpoint', () => {
      expect.assertions(1)
      executeRpcCall.warm('/api/endpoint')
      expect(global.fetch).toBeCalled()
    })
  })

  describe('POST', () => {
    it('makes the request', async () => {
      expect.assertions(2)
      const fetchMock = jest
        .spyOn(global, 'fetch')
        .mockImplementationOnce(() => Promise.resolve())
        .mockImplementationOnce(() => Promise.resolve({json: () => ({result: 'result', error: null})}))

      const resolverSpy = jest.fn()
      const rpcFn = getIsomorphicRpcHandler(resolverSpy, 'app/_rpc/queries/getProduct')

      try {
        const result = await rpcFn('/api/endpoint', {paramOne: 1234})
        expect(result).toBe('result')
        expect(fetchMock).toBeCalled()
      } finally {
        fetchMock.mockRestore()
      }
    })

    it('handles errors', async () => {
      expect.assertions(1)
      const fetchMock = jest
        .spyOn(global, 'fetch')
        .mockImplementation(() =>
          Promise.resolve({json: () => ({result: null, error: {name: 'Error', message: 'something broke'}})}),
        )

      const resolverSpy = jest.fn()
      const rpcFn = getIsomorphicRpcHandler(resolverSpy, 'app/_rpc/queries/getProduct')

      await expect(rpcFn('/api/endpoint', {paramOne: 1234})).rejects.toThrowError(/something broke/)
      fetchMock.mockRestore()
    })
  })
})
