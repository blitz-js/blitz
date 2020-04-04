import {resolve} from 'path'
export type ServerConfig = {
  rootFolder: string
  interceptNextErrors?: boolean
  devFolder?: string
  buildFolder?: string
  manifestPath?: string
  writeManifestFile?: boolean
}

const defaults = {
  ignoredPaths: [
    './build',
    '/.blitz*',
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
  manifestPath: '_manifest.json',
  writeManifestFile: true,
}

function ciLog(name: string, obj: any) {
  if (process.env.CI) {
    console.log('')
    console.log(
      'Logging the following to understand what is happening in our CI environment and investigate why we have been getting random CI test failures. This will be temporary.',
    )
    console.log(name, JSON.stringify(obj, null, 2))
    console.log('')
  }
  return obj
}

export function enhance(config: ServerConfig) {
  const devFolder = resolve(config.rootFolder, config.devFolder || defaults.devFolder)
  const buildFolder = resolve(config.rootFolder, config.buildFolder || defaults.buildFolder)
  const manifestPath = resolve(devFolder, config.manifestPath || defaults.manifestPath)
  const writeManifestFile =
    typeof config.writeManifestFile === 'undefined' ? defaults.writeManifestFile : config.writeManifestFile

  const nextBin = resolve(
    config.rootFolder,
    config.interceptNextErrors ? defaults.nextBinPatched : defaults.nextBin,
  )

  return ciLog('enhanced config', {
    ...config,
    ignoredPaths: defaults.ignoredPaths,
    includePaths: defaults.includePaths,
    manifestPath,
    nextBin,
    buildFolder,
    devFolder,
    writeManifestFile,
  })
}
