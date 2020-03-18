import {createMutation} from '@blitzjs/core'
import {Product, ProductModel} from 'app/product/ProductModel'
import db, {ProductCreateInput} from 'prisma/db'

export const createProduct = createMutation<ProductCreateInput, ProductModel>({
  validateInput: Product.validate,
  handler: async input => {
    if (!Product.authorize('create', input)) {
      throw new Error('AuthorizationError')
    }

    // Can do any pre-processing here or trigger events

    const product = await db.product.create({data: input.data})

    // Can do any post-processing here or trigger events

    return Product.model(product)
  },
})
