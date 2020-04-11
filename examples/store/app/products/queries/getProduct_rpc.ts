import {rpc} from '@blitzjs/core'
import getProduct from './getProduct'

const url = '/api/products/queries/getProduct'
const rpcFn = (params: any) => rpc(url, params)
rpcFn.cacheKey = url

export default rpcFn as typeof getProduct
