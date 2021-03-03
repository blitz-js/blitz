import {
  CancellablePromise,
  EnhancedResolver,
  EnhancedResolverRpcClient,
  FirstParam,
  PromiseReturnType,
  QueryFn,
} from "./types"
import {isClient} from "./utils"

export function invoke<T extends QueryFn, TInput = FirstParam<T>>(
  queryFn: T,
  params: TInput,
): CancellablePromise<PromiseReturnType<T>> {
  if (typeof queryFn === "undefined") {
    throw new Error(
      "invoke is missing the first argument - it must be a query or mutation function",
    )
  }

  if (isClient) {
    const fn = (queryFn as unknown) as EnhancedResolverRpcClient<TInput, PromiseReturnType<T>>
    return fn(params, {fromInvoke: true})
  } else {
    const fn = (queryFn as unknown) as EnhancedResolver<TInput, PromiseReturnType<T>>
    return fn(params) as ReturnType<T>
  }
}
