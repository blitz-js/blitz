import {readJSON} from "fs-extra"
import path from "path"
import pkgDir from "pkg-dir"
import resolveCwd from "resolve-cwd"
const debug = require("debug")("blitz:utils")

export async function resolveBinAsync(pkg: string, executable = pkg) {
  const packageDir = await pkgDir(resolveCwd(pkg))
  if (!packageDir) throw new Error(`Could not find package.json for '${pkg}'`)

  const {bin} = await readJSON(path.join(packageDir, "package.json"))
  const binPath = typeof bin === "object" ? bin[executable] : bin

  if (!binPath) throw new Error(`No bin '${executable}' in module '${pkg}'`)
  debug("binPath: " + binPath)

  const fullPath = path.join(packageDir, binPath)
  debug("fullPath: " + fullPath)

  return fullPath
}
