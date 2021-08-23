import { QueryClient, QueryKey } from 'react-query'
import { serialize } from 'superjson'
import { isClient, isServer } from '../stdlib/index'
import { requestIdleCallback } from '../client/request-idle-callback'
import { ResolverType, RpcClient } from './rpc'
import { AsyncFunc } from '../types/utils'
import { Resolver } from '../server/api-utils'

type MutateOptions = {
  refetch?: boolean
}

export const initializeQueryClient = () => {
  let suspenseEnabled = true
  if (!process.env.CLI_COMMAND_CONSOLE && !process.env.CLI_COMMAND_DB) {
    suspenseEnabled = Boolean(process.env.__BLITZ_SUSPENSE_ENABLED)
  }

  return new QueryClient({
    defaultOptions: {
      queries: {
        ...(isServer && { cacheTime: 0 }),
        suspense: suspenseEnabled,
        retry: (failureCount, error: any) => {
          if (process.env.NODE_ENV !== 'production') return false

          // Retry (max. 3 times) only if network error detected
          if (error.message === 'Network request failed' && failureCount <= 3)
            return true

          return false
        },
      },
    },
  })
}

// Create internal QueryClient instance
export const queryClient = initializeQueryClient()

function isRpcClient(f: any): f is RpcClient<any, any> {
  return !!f._isRpcClient
}

export interface QueryCacheFunctions<T> {
  setQueryData: (
    newData: T | ((oldData: T | undefined) => T),
    opts?: MutateOptions
  ) => ReturnType<typeof setQueryData>
}

export const getQueryCacheFunctions = <TInput, TResult, T extends AsyncFunc>(
  resolver: T | Resolver<TInput, TResult> | RpcClient<TInput, TResult>,
  params: TInput
): QueryCacheFunctions<TResult> => ({
  setQueryData: (newData, opts = { refetch: true }) => {
    return setQueryData(resolver, params, newData, opts)
  },
})

export const emptyQueryFn: RpcClient<unknown, unknown> = (() => {
  const fn = ((() => new Promise(() => {})) as any) as RpcClient
  fn._isRpcClient = true
  return fn
})()

const isNotInUserTestEnvironment = () => {
  if (process.env.JEST_WORKER_ID === undefined) return true
  if (process.env.BLITZ_TEST_ENVIRONMENT !== undefined) return true
  return false
}

export const validateQueryFn = <TInput, TResult>(
  queryFn: Resolver<TInput, TResult> | RpcClient<TInput, TResult>
) => {
  if (isClient && !isRpcClient(queryFn) && isNotInUserTestEnvironment()) {
    throw new Error(
      `Either the file path to your resolver is incorrect (must be in a "queries" or "mutations" folder that isn't nested inside "pages" or "api") or you are trying to use Blitz's useQuery to fetch from third-party APIs (to do that, import useQuery directly from "react-query")`
    )
  }
}

const sanitize = (type: ResolverType) => <TInput, TResult>(
  queryFn: Resolver<TInput, TResult> | RpcClient<TInput, TResult>
): RpcClient<TInput, TResult> => {
  if (isServer) return queryFn as any

  validateQueryFn(queryFn)

  const rpcClient = queryFn as RpcClient<TInput, TResult>

  const queryFnName = type === 'mutation' ? 'useMutation' : 'useQuery'

  if (rpcClient._resolverType !== type && isNotInUserTestEnvironment()) {
    throw new Error(
      `"${queryFnName}" was expected to be called with a ${type} but was called with a "${rpcClient._resolverType}"`
    )
  }

  return rpcClient
}

export const sanitizeQuery = sanitize('query')
export const sanitizeMutation = sanitize('mutation')

export const getQueryKeyFromUrlAndParams = (url: string, params: unknown) => {
  const queryKey = [url]

  const args = typeof params === 'function' ? (params as Function)() : params
  queryKey.push(serialize(args) as any)

  return queryKey as [string, any]
}

export function getQueryKey<TInput, TResult, T extends AsyncFunc>(
  resolver: T | Resolver<TInput, TResult> | RpcClient<TInput, TResult>,
  params?: TInput
) {
  if (typeof resolver === 'undefined') {
    throw new Error(
      'getQueryKey is missing the first argument - it must be a resolver function'
    )
  }

  return getQueryKeyFromUrlAndParams(sanitizeQuery(resolver)._routePath, params)
}

export function invalidateQuery<TInput, TResult, T extends AsyncFunc>(
  resolver: T | Resolver<TInput, TResult> | RpcClient<TInput, TResult>,
  params?: TInput
) {
  if (typeof resolver === 'undefined') {
    throw new Error(
      'invalidateQuery is missing the first argument - it must be a resolver function'
    )
  }

  const fullQueryKey = getQueryKey(resolver, params)
  let queryKey: QueryKey
  if (params) {
    queryKey = fullQueryKey
  } else {
    // Params not provided, only use first query key item (url)
    queryKey = fullQueryKey[0]
  }
  return queryClient.invalidateQueries(queryKey)
}

export function setQueryData<TInput, TResult, T extends AsyncFunc>(
  resolver: T | Resolver<TInput, TResult> | RpcClient<TInput, TResult>,
  params: TInput,
  newData: TResult | ((oldData: TResult | undefined) => TResult),
  opts: MutateOptions = { refetch: true }
): Promise<void | ReturnType<typeof queryClient.invalidateQueries>> {
  if (typeof resolver === 'undefined') {
    throw new Error(
      'setQueryData is missing the first argument - it must be a resolver function'
    )
  }
  const queryKey = getQueryKey(resolver, params)

  return new Promise((res) => {
    queryClient.setQueryData(queryKey, newData)
    let result: void | ReturnType<typeof queryClient.invalidateQueries>
    if (opts.refetch) {
      result = invalidateQuery(resolver, params)
    }
    if (isClient) {
      // Fix for https://github.com/blitz-js/blitz/issues/1174
      requestIdleCallback(() => {
        res(result)
      })
    } else {
      res(result)
    }
  })
}
