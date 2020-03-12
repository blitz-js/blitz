import {ActionResult, UserContext} from '@blitzjs/core/types'
import {ProductModel, Product, validateProduct} from 'app/product/ProductModel'
import db from 'prisma/db'

type CreateProductInput = {
  user: UserContext
  query: any
  attrs: Product
}

export async function createProduct(input: CreateProductInput): Promise<ActionResult<ProductModel>> {
  try {
    validateProduct(input.attrs)

    // Can do any pre-processing here or trigger events

    const result = await db().product.create({data: input.attrs})

    // Can do any post-processing here or trigger events

    return {success: {payload: ProductModel(result)}}
  } catch (error) {
    return {error: {messages: error.messages}}
  }
}
