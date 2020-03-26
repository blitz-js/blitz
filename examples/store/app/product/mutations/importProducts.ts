import {UserContext} from '@blitzjs/core/types'
import {ProductCreateInput} from 'app/product/ProductModel'
import {createProduct} from '.'

export default async function(data: ProductCreateInput[], user: UserContext) {
  let numberOfCreatedProducts = 0
  let errors: any[] = []

  for (let product of data) {
    try {
      await createProduct(data, user)
      numberOfCreatedProducts++
    } catch (error) {
      errors.push({name: product.name, error})
    }
  }

  if (errors) throw new Error(errors)

  return numberOfCreatedProducts
}
