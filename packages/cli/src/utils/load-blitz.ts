import {forceRequire} from './module'

export const BLITZ_MODULE_PATHS = ['@prisma/client']

export const loadBlitz = () => {
  return Object.assign({}, ...BLITZ_MODULE_PATHS.map(forceRequire))
}
