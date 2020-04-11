import {rpcHandler} from '@blitzjs/core'
import getProducts from 'app/products/queries/getProducts'
import db from 'prisma'

export default rpcHandler('query', 'getProducts', getProducts, () => db.connect())
