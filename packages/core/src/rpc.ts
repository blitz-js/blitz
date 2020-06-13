import {deserializeError} from 'serialize-error'
import {queryCache} from 'react-query'
import {getQueryKey} from './utils'

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

export type RpcFunction = {
  (params: any, opts?: Options): ReturnType<typeof executeRpcCall>
  cacheKey?: string
}

export function getIsomorphicRpcHandler(resolver: any, cacheKey: string) {
  if (typeof window !== 'undefined') {
    const url = cacheKey.replace(/^app\/_resolvers/, '/api')
    let rpcFn: RpcFunction = (params, opts = {}) => executeRpcCall(url, params, opts)
    rpcFn.cacheKey = url

    // Warm the lambda
    executeRpcCall.warm(url)
    return rpcFn
  } else {
    return resolver
  }
}
