import {Controller, harnessServerProps} from '../src/controller'

const SimpleController = Controller(() => ({
  name: 'SimpleController',

  async index() {
    return {status: 200, data: {message: 'indexed'}}
  },

  async show() {
    return {status: 200, data: {message: 'shown'}}
  },

  async create() {
    return {
      status: 201,
      data: {message: 'created'},
    }
  },

  async update() {
    return {
      status: 200,
      data: {message: 'updated'},
    }
  },

  async delete() {
    return {
      status: 204,
      data: {},
    }
  },
}))

const EmptyController = Controller(() => ({
  name: 'EmptyController',
}))

const RedirectController = Controller(() => ({
  name: 'RedirectController',

  async create() {
    return {redirect: {href: 'href', as: 'as'}}
  },
}))

export const SpyController = Controller(() => ({
  name: 'SpyController',
  index: jest.fn(),
  show: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}))

export const getSimpleServerProps = harnessServerProps(SimpleController)
export const getEmptyServerProps = harnessServerProps(EmptyController)
export const getRedirectServerProps = harnessServerProps(RedirectController)
export const getSpyServerProps = harnessServerProps(SpyController)
