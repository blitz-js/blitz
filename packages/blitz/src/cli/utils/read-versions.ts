import {join} from "path"
import pkgDir from "pkg-dir"
import resolveFrom from "resolve-from"

const globalBlitzPath = resolveFrom.silent(__dirname, "blitz")
const localBlitzPath = resolveFrom.silent(process.cwd(), "blitz")
const localBlitzAuthPath = resolveFrom.silent(process.cwd(), "@blitzjs/auth")
const localBlitzRpcPath = resolveFrom.silent(process.cwd(), "@blitzjs/rpc")
const localBlitzNextPath = resolveFrom.silent(process.cwd(), "@blitzjs/next")

export function readVersions() {
  const globalBlitzPkgJsonPath = pkgDir.sync(globalBlitzPath)
  const localBlitzPkgJsonPath = pkgDir.sync(localBlitzPath)
  const localBlitzAuthPkgJsonPath = pkgDir.sync(localBlitzAuthPath)
  const localBlitzNextPkgJsonPath = pkgDir.sync(localBlitzNextPath)
  const localBlitzRpcPkgJsonPath = pkgDir.sync(localBlitzRpcPath)

  const versions: {
    globalVersion?: string
    localVersions: {
      blitz?: string
      blitzAuth?: string
      blitzRpc?: string
      blitzNext?: string
    }
  } = {globalVersion: "", localVersions: {}}

  // This branch won't run if user does `npx blitz` or `yarn blitz`
  if (globalBlitzPkgJsonPath && globalBlitzPkgJsonPath !== localBlitzPkgJsonPath) {
    versions.globalVersion = require(join(globalBlitzPkgJsonPath, "package.json")).version
  }

  if (localBlitzPkgJsonPath) {
    versions.localVersions.blitz = require(join(localBlitzPkgJsonPath, "package.json")).version
  }

  if (localBlitzAuthPkgJsonPath) {
    versions.localVersions.blitzAuth = require(join(
      localBlitzAuthPkgJsonPath,
      "package.json",
    )).version
  }

  if (localBlitzNextPkgJsonPath) {
    versions.localVersions.blitzNext = require(join(
      localBlitzNextPkgJsonPath,
      "package.json",
    )).version
  }

  if (localBlitzRpcPkgJsonPath) {
    versions.localVersions.blitzRpc = require(join(
      localBlitzRpcPkgJsonPath,
      "package.json",
    )).version
  }

  return versions
}

export function resolveVersionType(
  version: string,
): "alpha" | "beta" | "canary" | "stable" | "danger" | "latest" {
  if (version.includes("alpha")) {
    return "alpha"
  }

  if (version.includes("beta")) {
    return "beta"
  }

  if (version.includes("danger")) {
    return "danger"
  }

  if (version.includes("canary")) {
    return "canary" as const
  }

  return "latest" as const
}
