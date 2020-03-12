import {ActionInput, ActionResult} from '@blitzjs/core/types'
import {Product, ProductAttrs, ProductModel} from 'app/product/ProductModel'
import db from 'prisma/db'

type CreateProductInput = ActionInput & {
  attrs: ProductAttrs
}

export async function createProduct(input: CreateProductInput): Promise<ActionResult<ProductModel>> {
  try {
    if (!Product.authorize('create', input)) {
      return {error: {type: 'AuthorizationError'}}
    }

    const result = Product.validate(input.attrs)
    if (!result.valid) {
      return {error: {type: 'ValidationError', payload: result.errors}}
    }

    // Can do any pre-processing here or trigger events

    const product = await db.product.create({data: input.attrs})

    // Can do any post-processing here or trigger events

    return {success: {payload: Product.model(product)}}
  } catch (error) {
    return {error: {type: 'PersistanceError', payload: error.message}}
  }
}
