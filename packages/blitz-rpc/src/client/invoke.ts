import {FirstParam, PromiseReturnType, isClient, Ctx} from "blitz"
import {RpcClient} from "./rpc"

export async function invoke<T extends (...args: any) => any, TInput = FirstParam<T>>(
  queryFn: T,
  params: TInput,
): Promise<PromiseReturnType<T>>
export async function invoke<T extends (...args: any) => any, TInput = FirstParam<T>>(
  queryFn: T,
  params: TInput,
  isServer: boolean,
): Promise<PromiseReturnType<T>>
export async function invoke<T extends (...args: any) => any, TInput = FirstParam<T>>(
  queryFn: T,
  params: TInput,
  isServer = typeof window === "undefined" ? true : false,
): Promise<PromiseReturnType<T>> {
  if (typeof queryFn === "undefined") {
    throw new Error(
      "invoke is missing the first argument - it must be a query or mutation function",
    )
  }

  if (isServer) {
    const {getBlitzContext} = await import("@blitzjs/auth").catch((e) => {
      throw new Error(
        `invoke with isServer parameter can only be used in a Blitz powered Nextjs app directory. Make sure you have installed the @blitzjs/auth package.`,
      )
    })
    const ctx = await getBlitzContext()
    return queryFn(params, ctx) as PromiseReturnType<T>
  }

  if (isClient) {
    const fn = queryFn as unknown as RpcClient
    return fn(params, {fromInvoke: true}) as PromiseReturnType<T>
  } else {
    const fn = queryFn as unknown as RpcClient
    return fn(params) as PromiseReturnType<T>
  }
}

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

export function invokeServer<T extends (...args: any) => any, TInput = FirstParam<T>>(
  queryFn: T,
  params: TInput,
  ctx: Ctx,
): Promise<PromiseReturnType<T>> {
  if (typeof queryFn === "undefined") {
    throw new Error(
      "invokeServer is missing the first argument - it must be a query or mutation function",
    )
  }
  return queryFn(params, ctx)
}
