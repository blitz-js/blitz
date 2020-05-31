import {deserializeError} from 'serialize-error'
import {queryCache} from 'react-query'
import {getQueryKey} from './utils'

export async function rpc(url: string, params: any) {
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

  const json = await result.json()

  if (json.error) {
    throw deserializeError(json.error)
  } else {
    const queryKey = getQueryKey(url, params)
    queryCache.setQueryData(queryKey, json.result)
    return json.result
  }
}

rpc.warm = (url: string) => {
  if (typeof window !== 'undefined') {
    window.fetch(url, {method: 'HEAD'})
  }
}

export function isomorphicRpc(resolver: any, cacheKey: string) {
  if (typeof window !== 'undefined') {
    const url = cacheKey.replace(/^app\/_rpc/, '/api')
    const rpcFn: any = (params: any) => rpc(url, params)
    rpcFn.cacheKey = url

    // Warm the lambda
    rpc.warm(url)
    return rpcFn
  } else {
    return resolver
  }
}
