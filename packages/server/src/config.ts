import {resolve} from 'path'
import {ciLog} from './ciLog'
import {resolveBinAsync} from './resolve-bin-async'

export type ServerConfig = {
  rootFolder: string
  interceptNextErrors?: boolean
  devFolder?: string
  buildFolder?: string
  manifestPath?: string
  writeManifestFile?: boolean
  serverless?: boolean
}

const defaults = {
  ignoredPaths: [
    './build',
    '.blitz-*/**/*',
    '.blitz/**/*',
    '.DS_Store',
    '.git',
    '.next',
    '*.log',
    '.now',
    '*.pnp.js',
    './coverage',
    './dist',
    'node_modules',
  ],
  includePaths: ['**/*'],
  devFolder: '.blitz/caches/dev',
  buildFolder: '.blitz/caches/build',
  nextBinPatched: './node_modules/.bin/next-patched',
  manifestPath: '_manifest.json',
  writeManifestFile: true,
}

export async function enhance(config: ServerConfig) {
  const devFolder = resolve(config.rootFolder, config.devFolder || defaults.devFolder)
  const buildFolder = resolve(config.rootFolder, config.buildFolder || defaults.buildFolder)
  const manifestPath = resolve(devFolder, config.manifestPath || defaults.manifestPath)
  const writeManifestFile =
    typeof config.writeManifestFile === 'undefined' ? defaults.writeManifestFile : config.writeManifestFile

  const nextBinOrig = await resolveBinAsync('next')
  const nextBinPatched = await resolveBinAsync('@blitzjs/server', 'next-patched')

  const nextBin = resolve(config.rootFolder, config.interceptNextErrors ? nextBinPatched : nextBinOrig)

  return ciLog(
    `
Logging the following to understand what is happening in our CI environment
and investigate why we have been getting random CI test failures.
This will be temporary.
`,
    {
      ...config,
      ignoredPaths: defaults.ignoredPaths,
      includePaths: defaults.includePaths,
      manifestPath,
      nextBin,
      buildFolder,
      devFolder,
      writeManifestFile,
    },
  )
}
