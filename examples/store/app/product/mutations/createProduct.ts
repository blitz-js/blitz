import {createMutation} from '@blitzjs/core'
import {Product} from 'app/product/ProductModel'
import db, {ProductCreateInput} from 'prisma/db'

export const createProduct = createMutation<ProductCreateInput>({
  validateInput: Product.validate,
  handler: async ({user, data}) => {
    // Can do any pre-processing here or trigger events

    const product = await Product.user(user).create({data})

    // Can do any post-processing here or trigger events

    return product
  },
})
