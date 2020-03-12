import {Controller} from '@blitzjs/core'
import {importProducts} from 'app/product/actions'

export const ProductImportController = Controller(({}) => ({
  //TODO: Blitz should automatically add this name (used for logging & debug)
  name: 'ProductImportController',

  async create(ctx) {
    const {success, error} = await importProducts({
      user: ctx.user,
      products: ctx.payload,
      query: ctx.query,
    })

    if (success) {
      return {
        data: success.payload,
        redirect: {
          href: '/products',
        },
      }
    } else {
      return {
        data: error.payload,
        status: 400,
      }
    }
  },
}))
