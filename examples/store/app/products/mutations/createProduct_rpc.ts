import {rpc} from '@blitzjs/core'
import createProduct from './createProduct'

const url = '/api/products/mutations/createProduct'
const rpcFn = (params: any) => rpc(url, params)
rpcFn.cacheKey = url

// Warm the lambda
rpc.warm(url)

export default rpcFn as typeof createProduct
