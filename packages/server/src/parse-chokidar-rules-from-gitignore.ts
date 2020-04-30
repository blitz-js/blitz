import parseGitignore from 'parse-gitignore'
import fs from 'fs'
import {resolve} from 'path'
import _ from 'lodash'

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

export function parseChokidarRulesFromGitignore(rootFolder: string) {
  const result: {ignoredPaths: string[]; includePaths: string[]} = {
    includePaths: [],
    ignoredPaths: [],
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
