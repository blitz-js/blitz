import {createProduct} from '.'
import db from 'prisma/db'

const AnonymousUser = {id: null, roles: []}

jest.mock('prisma/db')

it('creates a product', async () => {
  // ts-ignore
  db.product.create.mockResolvedValue({id: 1, name: 'Green Shirt', description: null, price: null})

  const result = await createProduct({user: AnonymousUser, query: {}, attrs: {name: 'Green Shirt'}})

  expect(result).toBe('blue-hat')
})
