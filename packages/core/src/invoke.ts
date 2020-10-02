import {QueryFn, FirstParam, PromiseReturnType, Resolver, EnhancedResolverRpcClient} from "./types"
import {isClient} from "./utils"

export function invoke<T extends QueryFn, TInput = FirstParam<T>, TResult = PromiseReturnType<T>>(
  queryFn: T,
  params: TInput,
) {
  if (typeof queryFn === "undefined") {
    throw new Error(
      "invoke is missing the first argument - it must be a query or mutation function",
    )
  }

  if (isClient) {
    const fn = (queryFn as unknown) as EnhancedResolverRpcClient<TInput, TResult>
    return fn(params, {fromInvoke: true})
  } else {
    const fn = queryFn as Resolver<TInput, TResult>
    return fn(params) as ReturnType<T>
  }
}
