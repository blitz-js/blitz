import glob from 'fast-glob'
import {lstatSync} from 'fs'
import {join} from 'path'

// glob all the files in a dir and get the latest mtime:
export const getDirMtime = async (path: string) => {
  const files = await glob(
    process.platform === 'win32'
      ? join(path, '{,!(node_modules|.blitz|.git)/**/}*.*').replace(/\\/g, '/')
      : join(path, '{,!(node_modules|.blitz|.git)/**/}*.*'),
  )

  const orderedFiles = files
    .filter((f) => lstatSync(f).isFile())
    .map((file) => ({file, mtime: lstatSync(file).mtime}))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())

  return orderedFiles[0].mtime.getTime()
}
