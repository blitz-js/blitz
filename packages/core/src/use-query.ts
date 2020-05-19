import {useQuery as useReactQuery, QueryResult, QueryOptions} from 'react-query'
import {PromiseReturnType, InferUnaryParam} from './types'

type QueryFn = (...args: any) => Promise<any>
type RestQueryResult<T extends QueryFn> = Omit<QueryResult<PromiseReturnType<T>>, 'data'>

export function useQuery<T extends QueryFn>(
  queryFn: T,
  params?: InferUnaryParam<T>,
  options?: QueryOptions<T>,
): [PromiseReturnType<T>, RestQueryResult<T>] {
  const {data, ...rest} = useReactQuery({
    queryKey: [(queryFn as any).cacheKey, params],
    queryFn: (_: string, params) => queryFn(params),
    config: {
      suspense: true,
      retry: process.env.NODE_ENV === 'production' ? 3 : false,
      ...options,
    },
  })
  return [data as PromiseReturnType<T>, rest as RestQueryResult<T>]
}
