import {rpc} from '@blitzjs/core'
import updateProduct from './updateProduct'

const url = '/api/products/mutations/updateProduct'
const rpcFn = (params: any) => rpc(url, params)
rpcFn.cacheKey = url

// Warm the lambda
rpc.warm(url)

export default rpcFn as typeof updateProduct
