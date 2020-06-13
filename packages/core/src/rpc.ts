import {deserializeError} from 'serialize-error'
import {queryCache} from 'react-query'
import {getQueryKey} from './utils'
import {ResolverModule} from './middleware'

type Options = {
  fromQueryHook?: boolean
}

export async function executeRpcCall(url: string, params: any, opts: Options = {}) {
  if (typeof window === 'undefined') return
  const result = await window.fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    body: JSON.stringify({params}),
  })

  let json
  try {
    json = await result.json()
  } catch (error) {
    throw new Error(`Failed to parse json from request to ${url}`)
  }

  if (json.error) {
    throw deserializeError(json.error)
  } else {
    if (!opts.fromQueryHook) {
      const queryKey = getQueryKey(url, params)
      queryCache.setQueryData(queryKey, json.result)
    }
    return json.result
  }
}

executeRpcCall.warm = (url: string) => {
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    window.fetch(url, {method: 'HEAD'})
  }
}

interface ResolverEnhancement {
  resolverName: string
  type: string
  path: string
  cacheKey: string
}
export interface RpcFunction extends ResolverEnhancement {
  (params: any, opts?: Options): ReturnType<typeof executeRpcCall>
}
export interface EnhancedResolverModule extends ResolverEnhancement, ResolverModule {}

export function getIsomorphicRpcHandler(
  resolver: ResolverModule,
  resolverPath: string,
  resolverName: string,
  _resolverType: string,
) {
  const url = resolverPath.replace(/^app\/_rpc/, '/api')

  let handler: any =
    typeof window === 'undefined' ? resolver : (params: any, opts = {}) => executeRpcCall(url, params, opts)

  handler = handler as ResolverEnhancement
  handler.resolverName = resolverName
  handler.path = resolverPath
  handler.cacheKey = url

  if (typeof window === 'undefined') {
    return handler as EnhancedResolverModule
  } else {
    // Warm the lambda
    executeRpcCall.warm(url)
    return handler as RpcFunction
  }
}

// export function getIsomorphicRpcHandler(
//   resolver: ResolverModule,
//   resolverPath: string,
//   resolverName: string,
//   resolverType: string,
// ) {
//   if (typeof window !== 'undefined') {
//     const url = resolverPath.replace(/^app\/_rpc/, '/api')
//     let fn: any = (params: any, opts = {}) => executeRpcCall(url, params, opts)
//
//     fn.cacheKey = url
//     fn.name = resolverName
//     fn.type = resolverType
//     fn.path = resolverPath
//
//     let rpcFn: RpcFunction = fn
//
//     // Warm the lambda
//     executeRpcCall.warm(url)
//     return rpcFn
//   } else {
//     return resolver
//   }
// }
