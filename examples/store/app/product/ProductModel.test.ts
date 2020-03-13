import {Product} from './ProductModel'

it('computes displaySlug', async () => {
  const product = Product.model({id: 1, name: 'Blue Hat', description: null, price: null})

  expect(product.displaySlug).toBe('blue-hat')
})
