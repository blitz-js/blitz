import {rpc} from '@blitzjs/core'
import getProducts from './getProducts'

const url = '/api/products/queries/getProducts'
const rpcFn = (params: any) => rpc(url, params)
rpcFn.cacheKey = url

// Warm the lambda
rpc.warm(url)

export default rpcFn as typeof getProducts
