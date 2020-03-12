import {ModelDefinition, ValidationResult} from '@blitzjs/core/types'
import {Product as DBProduct} from 'prisma/db'

export type ProductAttrs = DBProduct
export type ProductModel = ProductAttrs & {
  displaySlug?: string
}

export const Product: ModelDefinition<ProductAttrs, ProductModel> = {
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
    const result: ValidationResult = {
      valid: true,
      errors: [],
    }

    // Can/should we somehow do runtime validation based on the TS type?

    if (attrs.name && attrs.name.length < 4) {
      result.valid = false
      result.errors.push({field: 'name', message: 'Name must be longer than 4 characters'})
    }

    return result
  },
}
