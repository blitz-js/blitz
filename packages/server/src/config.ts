import {resolve} from 'path'
export type ServerConfig = {
  rootFolder: string
  interceptNextErrors?: boolean
}

const defaults = {
  ignoredPaths: [
    './build',
    '.blitz',
    '.DS_Store',
    '.git',
    '.next',
    '*.log',
    '.now',
    '*.pnp.js',
    '/coverage',
    '/dist',
    'node_modules',
  ],
  includePaths: ['**/*'],
  devFolder: '.blitz/caches/dev',
  buildFolder: '.blitz/caches/build',
  nextBin: './node_modules/.bin/next',
  nextBinPatched: './node_modules/.bin/next-patched',
}

export function enhance(config: ServerConfig) {
  const devFolder = resolve(config.rootFolder, defaults.devFolder)
  const buildFolder = resolve(config.rootFolder, defaults.buildFolder)
  const nextBin = resolve(
    config.rootFolder,
    config.interceptNextErrors ? defaults.nextBinPatched : defaults.nextBin,
  )

  return {
    ...config,
    ignoredPaths: defaults.ignoredPaths,
    includePaths: defaults.includePaths,
    nextBin,
    buildFolder,
    devFolder,
  }
}
