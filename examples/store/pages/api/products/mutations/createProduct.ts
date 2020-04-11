import {rpcHandler} from '@blitzjs/core'
import createProduct from 'app/products/mutations/createProduct'
import db from 'prisma'

export default rpcHandler('mutation', 'createProduct', createProduct, () => db.connect())
