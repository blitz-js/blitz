import {remove, pathExists, ensureDir} from 'fs-extra'

export async function clean(path: string) {
  if (await pathExists(path)) {
    await remove(path)
  }
  return await ensureDir(path)
}
