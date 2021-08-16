import { promises } from 'fs'
import { join } from 'path'
import {
  getIsPageFile,
  topLevelFoldersThatMayContainPages,
} from '../build/utils'

/**
 * Recursively read directory
 * @param  {string} dir Directory to read
 * @param  {RegExp} filter Filter for the file name, only the name part is considered, not the full path
 * @param  {string[]=[]} arr This doesn't have to be provided, it's used for the recursion
 * @param  {string=dir`} rootDir Used to replace the initial path, only the relative path is left, it's faster than path.relative.
 * @returns Promise array holding all relative paths
 */
export async function recursiveReadDir(
  dir: string,
  filter: RegExp,
  ignore?: RegExp,
  arr: string[] = [],
  rootDir: string = dir
): Promise<string[]> {
  const result = await promises.readdir(dir)

  await Promise.all(
    result.map(async (part: string) => {
      const absolutePath = join(dir, part)
      if (ignore && ignore.test(part)) return

      const pathStat = await promises.stat(absolutePath)

      if (pathStat.isDirectory()) {
        await recursiveReadDir(absolutePath, filter, ignore, arr, rootDir)
        return
      }

      if (!filter.test(part)) {
        return
      }

      arr.push(absolutePath.replace(rootDir, ''))
    })
  )

  return arr.sort()
}

export async function recursiveFindPages(
  dir: string,
  filter: RegExp,
  ignore?: RegExp,
  arr: string[] = [],
  rootDir: string = dir
): Promise<string[]> {
  let folders = await promises.readdir(dir)

  if (dir === rootDir) {
    folders = folders.filter((folder) =>
      topLevelFoldersThatMayContainPages.includes(folder)
    )
  }

  await Promise.all(
    folders.map(async (part: string) => {
      const absolutePath = join(dir, part)
      if (ignore && ignore.test(part)) return

      const pathStat = await promises.stat(absolutePath)

      if (pathStat.isDirectory()) {
        await recursiveFindPages(absolutePath, filter, ignore, arr, rootDir)
        return
      }

      if (!filter.test(part)) {
        return
      }

      const relativeFromRoot = absolutePath.replace(rootDir, '')
      if (getIsPageFile(relativeFromRoot)) {
        arr.push(relativeFromRoot)
        return
      }
    })
  )

  return arr.sort()
}
