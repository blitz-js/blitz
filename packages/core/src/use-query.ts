import {useQuery as useReactQuery, QueryResult, QueryOptions} from "react-query"
import {PromiseReturnType, InferUnaryParam, QueryFn} from "./types"
import {QueryCacheFunctions, getQueryCacheFunctions} from "./utils/query-cache"
import {EnhancedRpcFunction} from "./rpc"
import {useRouter} from "next/router"

type RestQueryResult<T extends QueryFn> = Omit<QueryResult<PromiseReturnType<T>>, "data"> &
  QueryCacheFunctions<PromiseReturnType<T>>

export const emptyQueryFn: EnhancedRpcFunction = (() => {
  const fn = () => new Promise(() => {})
  fn._meta = {
    name: "emptyQueryFn",
    type: "n/a",
    path: "n/a",
    apiUrl: "",
  }
  return fn
})()

export const useIsDevPrerender = () => {
  // It is Next.js prerender if a route parameter exists in pathname but router.query is empty
  const router = useRouter()
  const queryKeys = Object.keys(router.query)
  const isDevPrerender =
    process.env.NODE_ENV !== "production" &&
    /\[.*\]/.test(router.pathname) &&
    (queryKeys.length === 0 || (queryKeys.length === 1 && queryKeys[0] === "amp"))
  return isDevPrerender
}

export function useQuery<T extends QueryFn>(
  queryFn: T,
  params: InferUnaryParam<T> | (() => InferUnaryParam<T>),
  options?: QueryOptions<QueryResult<PromiseReturnType<T>>>,
): [PromiseReturnType<T>, RestQueryResult<T>] {
  if (typeof queryFn === "undefined") {
    throw new Error("useQuery is missing the first argument - it must be a query function")
  }

  if (typeof params === "undefined") {
    throw new Error(
      "useQuery is missing the second argument. This will be the input to your query function on the server. Pass `null` if the query function doesn't take any arguments",
    )
  }

  const queryRpcFn = useIsDevPrerender()
    ? emptyQueryFn
    : ((queryFn as unknown) as EnhancedRpcFunction)

  const {data, ...queryRest} = useReactQuery({
    queryKey: [
      queryRpcFn._meta.apiUrl,
      typeof params === "function" ? (params as Function)() : params,
    ],
    queryFn: (_: string, params) => queryRpcFn(params, {fromQueryHook: true}),
    config: {
      suspense: true,
      retry: process.env.NODE_ENV === "production" ? 3 : false,
      ...options,
    },
  })

  const rest = {
    ...queryRest,
    ...getQueryCacheFunctions<PromiseReturnType<T>>(queryRpcFn._meta.apiUrl),
  }

  return [data as PromiseReturnType<T>, rest as RestQueryResult<T>]
}
