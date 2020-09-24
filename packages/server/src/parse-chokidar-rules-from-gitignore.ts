import parseGitignore from "parse-gitignore"
import fs from "fs"
import partition from "lodash/partition"
import fastGlob from "fast-glob"

export function isControlledByUser(file: string) {
  if (file.startsWith("node_modules")) {
    return false
  }

  return true
}

export function getAllGitIgnores(rootFolder: string) {
  const files = fastGlob.sync(["**/.gitignore", "**/.git/info/exclude"], {cwd: rootFolder})
  return files.filter(isControlledByUser).map((file) => {
    const [prefix] = file.match(".git/info/exclude")
      ? file.split(".git/info/exclude")
      : file.split(".gitignore")
    return {
      gitIgnore: fs.readFileSync(file, {encoding: "utf8"}),
      prefix,
    }
  })
}

export function chokidarRulesFromGitignore({
  gitIgnore,
  prefix,
}: {
  gitIgnore: string
  prefix: string
}) {
  const rules = parseGitignore(gitIgnore)

  const isInclusionRule = (rule: string) => rule.startsWith("!")
  const [includePaths, ignoredPaths] = partition(rules, isInclusionRule)

  const trimExclamationMark = (rule: string) => rule.substring(1)
  const prefixPath = (_rule: string) => {
    const rule = _rule.startsWith("/") ? _rule.substring(1) : _rule

    if (!prefix) {
      return rule
    } else {
      return prefix + rule
    }
  }

  return {
    includePaths: includePaths.map(trimExclamationMark).map(prefixPath),
    ignoredPaths: ignoredPaths.map(prefixPath),
  }
}

export function parseChokidarRulesFromGitignore(rootFolder: string) {
  const result: {ignoredPaths: string[]; includePaths: string[]} = {
    includePaths: [],
    ignoredPaths: [],
  }

  getAllGitIgnores(rootFolder)
    .map(chokidarRulesFromGitignore)
    .forEach(({ignoredPaths, includePaths}) => {
      result.includePaths.push(...includePaths)
      result.ignoredPaths.push(...ignoredPaths)
    })

  return result
}
