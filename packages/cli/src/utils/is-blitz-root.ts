import {readJSON} from 'fs-extra'
import pkgDir from 'pkg-dir'
import {resolve} from 'path'

export enum IsBlitzRootError {
  notBlitz,
  notRoot,
  badPackageJson,
}

const checkParent = async (): Promise<false | number> => {
  const rootDir = await pkgDir('./')

  if (rootDir) {
    const file = await readJSON(resolve(rootDir, 'package.json'))

    if (file && Object.keys(file.dependencies || {}).includes('blitz')) {
      return process.cwd().slice(rootDir.length).split('/').length - 1
    }
  }

  return false
}

/**
 * @name isBlitzRoot
 * @returns IsBlitzRootError enum
 * notBlitz -> when can't find package.json in current folder and first found in parent
 *             doesn't have blitz in dependencies
 * notRoot -> if in a nested folder of blitz project (found blitz as depend in a parent package.json)
 * badPackageJson -> an error occurred while reading local package.json
 */

const isBlitzRoot = async (): Promise<{err: boolean; message?: IsBlitzRootError; depth?: number}> => {
  try {
    const local = await readJSON('./package.json')
    if (local) {
      if (Object.keys(local.dependencies || {}).includes('blitz')) {
        return {err: false}
      } else {
        return {
          err: true,
          message: IsBlitzRootError.notBlitz,
        }
      }
    }
    return {err: true, message: IsBlitzRootError.badPackageJson}
  } catch (err) {
    // No local package.json
    if (err.code === 'ENOENT') {
      const out = await checkParent()

      if (out === false) {
        return {
          err: true,
          message: IsBlitzRootError.notBlitz,
        }
      } else {
        return {
          err: true,
          message: IsBlitzRootError.notRoot,
          depth: out,
        }
      }
    }
  }
  return {err: true}
}

export default isBlitzRoot
