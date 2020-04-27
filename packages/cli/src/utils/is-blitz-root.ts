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

  console.log(rootDir)

  if (rootDir) {
    const file = await readJSON(resolve(rootDir, 'package.json'))

    if (file && Object.keys(file.dependencies || {}).includes('blitz')) {
      return process.cwd().slice(rootDir.length).split('/').length - 1
    }
  }

  return false
}

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
