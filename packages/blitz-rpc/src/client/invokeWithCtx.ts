import {FirstParam, PromiseReturnType, Ctx} from "blitz"

export function invokeWithCtx<T extends (...args: any) => any, TInput = FirstParam<T>>(
  queryFn: T,
  params: TInput,
  ctx: Ctx,
): Promise<PromiseReturnType<T>> {
  if (typeof queryFn === "undefined") {
    throw new Error(
      "invokeWithCtx is missing the first argument - it must be a query or mutation function",
    )
  }

  return queryFn(params, ctx)
}
