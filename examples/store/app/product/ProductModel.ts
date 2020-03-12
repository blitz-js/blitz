import type {Product} from '@prisma/client'
export type {Product} from '@prisma/client'

export type ProductModel = Product & {
  displaySlug?: string
}

export function validateProduct(attrs: Product) {
  // Can/should we somehow do runtime validation based on the TS type?

  if (attrs.name && attrs.name.length < 4) throw new Error('Name must be longer than 4 characters')

  return Object.assign({}, attrs)
}

export function ProductModel(attrs: Product): Readonly<ProductModel> {
  const model: ProductModel = validateProduct(attrs)

  // Computed fields
  model.displaySlug = model.name?.toLowerCase().replace(' ', '-')

  return Object.freeze(model)
}
