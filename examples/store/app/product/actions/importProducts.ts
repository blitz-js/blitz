import {ActionInput, ActionResult} from '@blitzjs/core/types'
import {ProductAttrs} from 'app/product/ProductModel'
import {createProduct} from '.'

type ImportProductsInput = ActionInput & {
  products: ProductAttrs[]
}

type ImportProductsOutput = {
  createdProducts: number
  errors: any
}

export async function importProducts(
  input: ImportProductsInput,
): Promise<ActionResult<ImportProductsOutput>> {
  let createdProducts = 0
  let errors: any[] = []

  for (let product of input.products) {
    const result = await createProduct({...input, attrs: product})
    if (result.success) {
      createdProducts++
    } else {
      errors.push({name: product.name, error: result.error})
    }
  }

  return {success: {payload: {createdProducts, errors}}}
}
