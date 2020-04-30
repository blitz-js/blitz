import {resolve} from 'path'
import {ciLog} from './ciLog'
import {resolveBinAsync} from './resolve-bin-async'
import {synchronizeFiles} from './synchronizer'
import parseGitignore from 'parse-gitignore'
import _ from 'lodash'
import fs from 'fs'

export type ServerConfig = {
  rootFolder: string
  interceptNextErrors?: boolean
  devFolder?: string
  buildFolder?: string
  manifestPath?: string
  writeManifestFile?: boolean
  watch?: boolean
  synchronizer?: typeof synchronizeFiles
}

const defaults = {
  ignoredPaths: [
    './build/**/*',
    './.blitz-*/**/*',
    './.blitz/**/*',
    '.DS_Store',
    '.git',
    '.next/**/*',
    '*.log',
    '.now',
    '*.pnp.js',
    'coverage/**/*',
    'dist/**/*',
    'node_modules/**/*',
    'cypress/**/*',
  ],
  includePaths: ['**/*'],
  devFolder: '.blitz/caches/dev',
  buildFolder: '.blitz/caches/build',
  nextBinPatched: './node_modules/.bin/next-patched',
  manifestPath: '_manifest.json',
  writeManifestFile: true,
}

function getAllGitIgnores(rootFolder: string) {
  function getGitIgnoresRecursively(folder: string, prefix: string): {gitIgnore: string; prefix: string}[] {
    const entries = fs.readdirSync(folder, {withFileTypes: true})
    const gitIgnoreFile = entries.find((dirent) => dirent.isFile() && dirent.name === '.gitignore')
    const gitIgnore = !!gitIgnoreFile && fs.readFileSync(resolve(folder, '.gitignore'), {encoding: 'utf8'})

    const subdirs = entries.filter((e) => e.isDirectory()).map((e) => e.name)
    const gitIgnoresInSubDirs = subdirs.flatMap((subdir) =>
      getGitIgnoresRecursively(resolve(folder, subdir), resolve(prefix, subdir)),
    )

    if (gitIgnore) {
      return gitIgnoresInSubDirs.concat({gitIgnore, prefix})
    } else {
      return gitIgnoresInSubDirs
    }
  }

  return getGitIgnoresRecursively(rootFolder, '')
}

function getPathRules(rootFolder: string) {
  const result: {ignoredPaths: string[]; includePaths: string[]} = {
    includePaths: defaults.includePaths,
    ignoredPaths: defaults.ignoredPaths,
  }

  for (const {gitIgnore, prefix} of getAllGitIgnores(rootFolder)) {
    const rules = parseGitignore(gitIgnore)

    const isInclusionRule = (rule: string) => rule.startsWith('!')
    const [includePaths, ignoredPaths] = _.partition(rules, isInclusionRule)

    const trimExclamationMark = (rule: string) => rule.substring(1)
    const prefixPath = (_rule: string) => {
      const rule = _rule.startsWith('/') ? _rule.substring(1) : _rule

      if (!prefix) {
        return rule
      } else {
        return prefix + '/' + rule
      }
    }

    result.includePaths.push(...includePaths.map(trimExclamationMark).map(prefixPath))
    result.ignoredPaths.push(...ignoredPaths.map(prefixPath))
  }

  return result
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
      ...getPathRules(resolve(process.cwd(), config.rootFolder)),
      manifestPath,
      nextBin,
      buildFolder,
      devFolder,
      writeManifestFile,
    },
  )
}
