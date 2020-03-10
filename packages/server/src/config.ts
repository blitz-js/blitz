import {resolve} from 'path'
export type Config = {
  rootFolder: string
  devFolder: string
  buildFolder: string
  interceptNextErrors?: boolean
}

export function enhance(config: Config) {
  const devFolder = resolve(config.rootFolder, config.devFolder)
  const buildFolder = resolve(config.rootFolder, config.buildFolder)
  const pathToNext = config.interceptNextErrors
    ? './node_modules/.bin/next-patched'
    : './node_modules/.bin/next'
  const nextBin = resolve(config.rootFolder, pathToNext)

  return {
    ...config,
    nextBin,
    buildFolder,
    devFolder,
  }
}
