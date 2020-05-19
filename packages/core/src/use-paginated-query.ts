import {usePaginatedQuery as usePaginatedReactQuery, PaginatedQueryResult, QueryOptions} from 'react-query'
import {PromiseReturnType, InferUnaryParam} from './types'

type QueryFn = (...args: any) => Promise<any>
type RestQueryResult<T extends QueryFn> = Omit<PaginatedQueryResult<PromiseReturnType<T>>, 'resolvedData'>

export function usePaginatedQuery<T extends QueryFn>(
  queryFn: T,
  params?: InferUnaryParam<T>,
  options?: QueryOptions<T>,
): [PromiseReturnType<T>, RestQueryResult<T>] {
  const {resolvedData, ...rest} = usePaginatedReactQuery({
    queryKey: [(queryFn as any).cacheKey, params],
    queryFn: (_: string, params) => queryFn(params),
    config: {
      suspense: true,
      retry: process.env.NODE_ENV === 'production' ? 3 : false,
      ...options,
    },
  })
  return [resolvedData as PromiseReturnType<T>, rest as RestQueryResult<T>]
}
