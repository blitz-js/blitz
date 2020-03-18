import {createProduct} from '.'

// const AnonymousUser = {id: null, roles: []}
const AdminUser = {id: null, roles: ['admin']}

it('creates a product', async () => {
  const result = await createProduct.handler({user: AdminUser, data: {name: 'Green Shirt'}})

  expect(result).toStrictEqual({
    description: null,
    displaySlug: 'green-shirt',
    id: 5,
    name: 'Green Shirt',
    price: null,
  })
})
