import {UserContext} from '@blitzjs/core/types'
import {Product, ProductCreateInput} from 'app/product/ProductModel'

export default async function(data: ProductCreateInput, user: UserContext) {
  // Can do any pre-processing here or trigger events

  const product = await Product.user(user).create({data})

  // Can do any post-processing here or trigger events

  return product
}
