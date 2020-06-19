import resolveCwd from "resolve-cwd"
import pkgDir from "pkg-dir"
import path from "path"

export async function resolveBinAsync(pkg: string, executable = pkg) {
  const packageDir = await pkgDir(resolveCwd(pkg))

  if (!packageDir) throw new Error(`Could not find package.json for '${pkg}'`)

  const {bin} = require(path.join(packageDir, "package.json"))
  const binPath = typeof bin === "object" ? bin[executable] : bin

  if (!binPath) throw new Error(`No bin '${executable}' in module '${pkg}'`)

  return path.join(packageDir, binPath)
}
