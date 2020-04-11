import {rpcHandler} from '@blitzjs/core'
import updateProduct from 'app/products/mutations/updateProduct'
import db from 'prisma'

export default rpcHandler('mutation', 'updateProduct', updateProduct, () => db.connect())
