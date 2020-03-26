import {UserContext} from '@blitzjs/core/types'
import {Product, FindOneProductArgs} from 'app/product/ProductModel'

export default async function(args: FindOneProductArgs, user?: UserContext) {
  // Can do any pre-processing here or trigger events

  const product = await Product.user(user).findOne(args)

  // Can do any post-processing here or trigger events

  return product
}
