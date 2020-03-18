import {createProduct} from '.'

// const AnonymousUser = {id: null, roles: []}
const AdminUser = {id: null, roles: ['admin']}

it('creates a product', async () => {
  const result = await createProduct({user: AdminUser, query: {}, attrs: {name: 'Green Shirt'}})

  expect(result.success?.payload).toStrictEqual({
    description: null,
    displaySlug: 'green-shirt',
    id: 5,
    name: 'Green Shirt',
    price: null,
  })
})
