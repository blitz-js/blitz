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
  const router = useRouter()
  if (process.env.NODE_ENV === "production") {
    return false
  } else {
    const currentRouteHasParameters = /\[.*\]/.test(router.pathname)
    const queryKeys = Object.keys(router.query)
    // This checks if query == {} || query == {amp: any}
    const queryIsEmpty =
      queryKeys.length === 0 || (queryKeys.length === 1 && queryKeys[0] === "amp")

    const isDevPrerender = currentRouteHasParameters && queryIsEmpty

    return isDevPrerender
  }
}

const isServer = typeof window === "undefined"

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

  const queryRpcFn =
    useIsDevPrerender() || isServer ? emptyQueryFn : ((queryFn as unknown) as EnhancedRpcFunction)

  console.log("prerender", useIsDevPrerender())
  console.log("window", typeof window)
  console.log("isServer", isServer)
  console.log("queryRpcFn", queryRpcFn)

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
