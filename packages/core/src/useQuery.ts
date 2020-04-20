import {useQuery as useReactQuery} from 'react-query'
import {PromiseReturnType} from '@prisma/client'
// TODO: why doesn't the type work properly from ../types?
// import {PromiseReturnType} from '../types'

type QueryFn = (...args: any) => Promise<any>

// interface QueryFn {
//   (...args: any): Promise<any>
//   cacheKey: string
// }

export function useQuery<T extends QueryFn>(
  queryFn: T,
  params?: any,
  options: any = {},
): [PromiseReturnType<T>, Record<any, any>] {
  const {data, ...rest} = useReactQuery([(queryFn as any).cacheKey, params], (_, params) => queryFn(params), {
    suspense: true,
    retry: process.env.NODE_ENV === 'production' ? 3 : false,
    ...options,
  })

  return [data as PromiseReturnType<T>, rest]
}
