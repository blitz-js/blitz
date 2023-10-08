import type {Ctx, FirstParam, PromiseReturnType} from "blitz"
import {RpcLogger} from "../rpc-logger"
import {LoggerOptions} from "./plugin"

export async function invoke<T extends (...args: any) => any, TInput = FirstParam<T>>(
  queryFn: T,
  params: TInput,
  ctx?: Ctx,
  loggingOptions?: LoggerOptions,
): Promise<PromiseReturnType<T>> {
  if (typeof queryFn === "undefined") {
    throw new Error(
      "invoke is missing the first argument - it must be a query or mutation function",
    )
  }
  const rpcLogger = new RpcLogger((queryFn as any)._resolverName, loggingOptions)
  rpcLogger.timer.initResolver()
  rpcLogger.preResolver(params)

  const result = await queryFn(params, ctx)
  rpcLogger.postResolver(result)

  rpcLogger.timer.resolverDuration()
  rpcLogger.timer.totalDuration()
  rpcLogger.postResponse()
  return result
}
