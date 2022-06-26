import {join} from "path"
import pkgDir from "pkg-dir"
import resolveFrom from "resolve-from"

const globalBlitzPath = resolveFrom(__dirname, "blitz")
const localBlitzPath = resolveFrom.silent(process.cwd(), "blitz")

export function readVersions() {
  const globalBlitzPkgJsonPath = pkgDir.sync(globalBlitzPath)
  const localBlitzPkgJsonPath = pkgDir.sync(localBlitzPath)

  const versions: {globalVersion?: string; localVersion?: string} = {}

  // This branch won't run if user does `npx blitz` or `yarn blitz`
  if (globalBlitzPkgJsonPath && globalBlitzPkgJsonPath !== localBlitzPkgJsonPath) {
    versions.globalVersion = require(join(globalBlitzPkgJsonPath, "package.json")).version
  }

  if (localBlitzPkgJsonPath) {
    versions.localVersion = require(join(localBlitzPkgJsonPath, "package.json")).version
  }

  return versions
}

export function resolveVersionType(version: string) {
  if (version.includes("alpha")) {
    return "alpha" as const
  }

  if (version.includes("danger")) {
    return "danger" as const
  }

  if (version.includes("canary")) {
    return "canary" as const
  }

  return "mainline" as const
}
