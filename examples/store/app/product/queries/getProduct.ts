import {createQuery} from '@blitzjs/core'
import {ProductModel} from 'app/product/ProductModel'
import db from 'prisma/db'

export type GetProductInput = {
  id: number
}
export type GetProductOutput = {
  product: ProductModel
}

export const getProduct = createQuery<GetProductInput, GetProductOutput>({
  handler: async input => {
    const product = await db.product.findOne({where: {id: input.data.id}})

    if (!product) {
      throw new Error('Not found')
    }

    return {
      product,
    }
  },
})
