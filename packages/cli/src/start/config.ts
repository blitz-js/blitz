import {resolve} from 'path'
export type Config = {
  rootFolder: string
  devFolder: string
  buildFolder: string
}

export function enhance(config: Config) {
  const nextBin = resolve(config.rootFolder, './node_modules/.bin/next')
  const devFolder = resolve(config.rootFolder, config.devFolder)
  const buildFolder = resolve(config.rootFolder, config.buildFolder)
  return {
    ...config,
    nextBin,
    buildFolder,
    devFolder,
  }
}
