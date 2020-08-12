import {useQuery as useReactQuery, QueryResult, QueryOptions} from "react-query"
import {PromiseReturnType, InferUnaryParam, QueryFn} from "./types"
import {QueryCacheFunctions, getQueryCacheFunctions} from "./utils/query-cache"
import {EnhancedRpcFunction} from "./rpc"

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

const isServer = typeof window === "undefined"

// NOTE - this is only for use inside useQuery
export const useIsDevPrerender = () => {
  if (process.env.NODE_ENV === "production") {
    return false
  } else {
    // useQuery is only for client-side data fetching, so if it's running on the
    // server, it's for pre-render
    return isServer
  }
}

export const retryFunction = (failureCount: number, error: any) => {
  if (process.env.NODE_ENV !== "production") return false
  if (error.name === "AuthenticationError") return false
  if (error.name === "AuthorizationError") return false
  if (error.name === "CSRFTokenMismatchError") return false
  if (error.name === "NotFoundError") return false
  if (error.name === "ZodError") return false
  // Prisma errors
  if (typeof error.code === "string" && error.code.startsWith("P")) return false
  if (failureCount > 2) return false

  return true
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
      retry: retryFunction,
      ...options,
    },
  })

  const rest = {
    ...queryRest,
    ...getQueryCacheFunctions<PromiseReturnType<T>>(queryRpcFn._meta.apiUrl),
  }

  return [data as PromiseReturnType<T>, rest as RestQueryResult<T>]
}
