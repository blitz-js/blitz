import finder from 'find-package-json'
import {readJSON} from 'fs-extra'

export enum IsBlitzRootError {
  notBlitz,
  notRoot,
  badPackageJson,
}

const checkParent = () => {
  const f = finder('.')
  const file = f.next()

  if (Object.keys(file.value?.dependencies || {}).includes('blitz')) {
    return process.cwd().slice(file.filename?.indexOf('/package.json')).split('/').length - 1
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
      console.log('No local pkg json, looking in parent')
      const out = checkParent()

      if (out === false) {
        console.error('No parent package.json')
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
