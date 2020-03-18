import {createMutation} from '@blitzjs/core'
import {createProduct} from '.'
import {ProductCreateInput} from 'prisma/db'

export const importProducts = createMutation<
  ProductCreateInput[],
  {createdProducts: number; errors: string[]}
>({
  handler: async input => {
    let createdProducts = 0
    let errors: any[] = []

    for (let product of input.data) {
      try {
        await createProduct.handler({user: input.user, data: product})
        createdProducts++
      } catch (error) {
        errors.push({name: product.name, error})
      }
    }

    return {createdProducts, errors}
  },
})
