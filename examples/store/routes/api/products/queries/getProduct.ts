import {rpcHandler} from '@blitzjs/core'
import getProduct from 'app/products/queries/getProduct'
import db from 'prisma'

export default rpcHandler('query', 'getProduct', getProduct, () => db.connect())
