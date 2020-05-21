import {readJSON} from 'fs-extra'
import pkgDir from 'pkg-dir'
import {resolve} from 'path'

export enum IsBlitzRootError {
  NotBlitz,
  NotRoot,
  BadPackageJson,
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
 * @returns {IsBlitzRootError}
 * notBlitz -> when can't find package.json in current folder and first found in parent
 *             doesn't have blitz in dependencies
 * notRoot -> if in a nested folder of blitz project (found blitz as depend in a parent package.json)
 * badPackageJson -> an error occurred while reading local package.json
 */

export const isBlitzRoot = async (): Promise<{err: boolean; message?: IsBlitzRootError; depth?: number}> => {
  try {
    const local = await readJSON('./package.json')
    if (local) {
      if (local.dependencies['blitz'] || local.devDependencies['blitz']) {
        return {err: false}
      } else {
        return {
          err: true,
          message: IsBlitzRootError.NotBlitz,
        }
      }
    }
    return {err: true, message: IsBlitzRootError.BadPackageJson}
  } catch (err) {
    // No local package.json
    if (err.code === 'ENOENT') {
      const out = await checkParent()

      if (out === false) {
        return {
          err: true,
          message: IsBlitzRootError.NotBlitz,
        }
      } else {
        return {
          err: true,
          message: IsBlitzRootError.NotRoot,
          depth: out,
        }
      }
    }
  }
  return {err: true}
}
