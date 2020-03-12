import {Controller} from '@blitzjs/core'
import {getProduct, getProducts, createProduct, updateProduct, deleteProduct} from 'app/product/actions'

export const ProductController = Controller(({}) => ({
  //TODO: Blitz should automatically add this name (used for logging & debug)
  name: 'ProductController',

  // I think this should move into the actions or model
  permit: ['title', 'content'],

  async index(ctx) {
    const {success, error} = await getProducts({user: ctx.user, query: ctx.query})

    if (success) {
      return {
        data: success.payload,
      }
    } else {
      return {
        data: error.messages,
        status: 400,
      }
    }
  },

  async show(ctx) {
    const {success, error} = await getProduct({user: ctx.user, id: ctx.id})

    if (success) {
      return {
        data: success.payload,
      }
    } else {
      return {
        data: error.messages,
        status: 400,
      }
    }
  },

  async create(ctx) {
    const {success, error} = await createProduct({
      user: ctx.user,
      query: ctx.query,
      attrs: ctx.payload,
    })

    if (success) {
      return {
        data: success.payload,
        redirect: {
          href: '/products/[id]',
          as: `/products/${success.payload.id}`,
        },
      }
    } else (error) {
      return {
        data: error.payload,
        status: 400,
      }
    }
  },

  async update(ctx) {
    const {success, error} = await updateProduct({user: ctx.user, id: ctx.id, attrs: ctx.payload})

    if (success) {
      return {
        data: success.payload,
        redirect: {
          href: '/products/[id]',
          as: `/products/${success.payload.id}`,
        },
      }
    } else {
      return {
        data: error.messages,
        status: 400,
      }
    }
  },

  async delete(ctx) {
    const {success, error} = await deleteProduct({user: ctx.user, id: ctx.id})

    if (success) {
      return {
        data: success.payload,
        redirect: {
          href: '/products',
        },
      }
    } else {
      return {
        data: error.messages,
        status: 400,
      }
    }
  },
}))
