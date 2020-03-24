import db from 'prisma/db'
import {Product} from './ProductModel'

const AnonymousUser = {id: null, roles: []}
const AdminUser = {id: null, roles: ['admin']}

console.log = jest.fn()

describe('ProductModel', () => {
  it('can manually authorize', () => {
    const result = Product.authorize({
      user: AnonymousUser,
      op: 'create',
      data: {id: 1, name: 'test', description: null, price: null},
    })

    expect(result).toBe(false)
  })

  it('findOne works for admin + computes displaySlug', async () => {
    const product = await Product.user(AdminUser).findOne({where: {id: 1}})

    expect(product).toStrictEqual({
      id: 1,
      name: 'Green Shirt',
      displaySlug: 'green-shirt',
      description: null,
      price: null,
    })
  })

  it('findMany works for admin + computes displaySlug', async () => {
    const products = await Product.user(AdminUser).findMany({where: {id: 1}})

    expect(products).toStrictEqual([
      {
        id: 1,
        name: 'Green Shirt',
        displaySlug: 'green-shirt',
        description: null,
        price: null,
      },
    ])
  })

  it('create fails for anonymous user', () => {
    const fn = Product.user(AnonymousUser).create({data: {name: 'test'}})

    expect(fn).rejects.toThrow('Unauthorized')
  })

  it('create fails validation', () => {
    const fn = Product.user(AdminUser).create({data: {name: 'in'}})

    expect(fn).rejects.toThrow('Name must be longer than 3 characters')
  })
})

afterAll(() => db.disconnect())
