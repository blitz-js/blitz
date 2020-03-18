import {ModelDefinition} from '@blitzjs/core/types'
import {Product as DBProduct, ProductUpdateInput} from 'prisma/db'

export type ProductAttrs = DBProduct
export type ProductModel = ProductAttrs & {
  displaySlug?: string
}

export const Product: ModelDefinition<ProductAttrs, ProductModel, ProductUpdateInput> = {
  model(attrs) {
    const model: ProductModel = Object.assign({}, attrs)

    // Computed fields
    model.displaySlug = model.name?.toLowerCase().replace(' ', '-')

    return Object.freeze(model)
  },
  authorize(op, input) {
    switch (op) {
      case 'read':
      case 'create':
      case 'update':
      case 'delete':
        if (input.user.roles.includes('admin')) {
          return true
        }
    }
    return false
  },
  validate(attrs) {
    const errors: Record<string, any> = {}

    // Can/should we somehow do runtime validation based on the TS type?

    if (attrs.name && attrs.name.length < 4) {
      errors.name = 'Name must be longer than 4 characters'
    }

    return errors
  },
}
