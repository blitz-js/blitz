import glob from 'fast-glob'
import {lstatSync} from 'fs'
import {join} from 'path'

export const getDirMtime = async (path: string) => {
  const files = await glob(join(path, '{,!(node_modules|.blitz|.git)/**/}*.*').replace(/\\/g, '/'))

  const sortedFiles = files
    .filter((f) => lstatSync(f).isFile())
    .map((file) => ({file, mtime: lstatSync(file).mtime}))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())

  return sortedFiles[0].mtime.getTime()
}
