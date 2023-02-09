import {FirstParam, PromiseReturnType, isClient} from "blitz"
import {RpcClient} from "./rpc"

export function invoke<T extends (...args: any) => any, TInput = FirstParam<T>>(
  queryFn: T,
  params: TInput,
): Promise<PromiseReturnType<T>> {
  if (typeof queryFn === "undefined") {
    throw new Error(
      "invoke is missing the first argument - it must be a query or mutation function",
    )
  }

  if (isClient) {
    const fn = queryFn as unknown as RpcClient
    return fn(params, {fromInvoke: true}) as ReturnType<T>
  } else {
    const fn = queryFn as unknown as RpcClient
    return fn(params) as ReturnType<T>
  }
}
