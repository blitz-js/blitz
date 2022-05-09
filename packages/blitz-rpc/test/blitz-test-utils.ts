// This enhance fn does what buildRpcFunction does during build time
export function buildQueryRpc(fn: any) {
  const newFn = (...args: any) => {
    const [data, ...rest] = args
    return fn(data, ...rest)
  }
  newFn._isRpcClient = true
  newFn._resolverType = "query"
  newFn._routePath = "/api/test/url/" + Math.random()
  return newFn
}

// This enhance fn does what buildRpcFunction does during build time
export function buildMutationRpc(fn: any) {
  const newFn = (...args: any) => fn(...args)
  newFn._isRpcClient = true
  newFn._resolverType = "mutation"
  newFn._routePath = "/api/test/url"
  return newFn
}
