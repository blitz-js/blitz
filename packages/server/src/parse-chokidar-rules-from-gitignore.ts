import {log} from "@blitzjs/display"
import spawn from "cross-spawn"
import expandTilde from "expand-tilde"
import fastGlob from "fast-glob"
import fs from "fs"
import partition from "lodash/partition"
import parseGitignore from "parse-gitignore"

const {GIT_DIR = ".git"} = process.env

function globalGitIgnore() {
  const versionResult = spawn.sync("git", ["version"])
  if (!(versionResult.status === 0)) {
    log.warning("Git doesn't seem to be installed. Get it here: https://git-scm.com/downloads.")
    return null
  }

  const configResult = spawn.sync("git", ["config", "--get", "core.excludesfile"], {
    stdio: "pipe",
  })
  if (!(configResult.status === 0)) {
    return null
  }

  const output = String(configResult.stdout).trim()
  return process.platform === "win32" ? output : expandTilde(output)
}

export function isControlledByUser(file: string) {
  if (file.startsWith("node_modules")) {
    return false
  }

  return true
}

export function getAllGitIgnores(rootFolder: string) {
  const globalIgnore = globalGitIgnore()
  const localRepoIgnore = `${GIT_DIR}/info/exclude`

  const files = fastGlob.sync([localRepoIgnore, "**/.gitignore", `**/${localRepoIgnore}`], {
    cwd: rootFolder,
  })

  if (fs.existsSync(globalIgnore)) files.push(globalIgnore)

  return files.filter(isControlledByUser).map((file) => {
    let prefix = ""

    if (file.match(localRepoIgnore)) prefix = file.split(localRepoIgnore)[0]
    else if (file.match(globalIgnore)) prefix = ""
    else prefix = file.split(".gitignore")[0]

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
