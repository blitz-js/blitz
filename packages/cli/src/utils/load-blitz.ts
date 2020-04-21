import {forceRequire} from './module'
import {join} from 'path'

export const BLITZ_MODULE_PATHS = ['db']

export const loadBlitz = () => {
  return Object.assign(
    {},
    {db: forceRequire(join(process.cwd(), 'db')).default},
    // ...BLITZ_MODULE_PATHS.map((path) => ({
    //   [path]: forceRequire(join(process.cwd(), 'db')).default,
    // })),
  )
}
