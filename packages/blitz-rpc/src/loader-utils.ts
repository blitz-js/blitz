import {assert} from "blitz"
import {win32, posix, sep} from "path"

export function assertPosixPath(path: string) {
  const errMsg = `Wrongly formatted path: ${path}`
  assert(!path.includes(win32.sep), errMsg)
  // assert(path.startsWith('/'), errMsg)
}

export function toPosixPath(path: string) {
  if (process.platform !== "win32") {
    assert(sep === posix.sep, "TODO")
    assertPosixPath(path)
    return path
  } else {
    assert(sep === win32.sep, "TODO")
    const pathPosix = path.split(win32.sep).join(posix.sep)
    assertPosixPath(pathPosix)
    return pathPosix
  }
}

export function toSystemPath(path: string) {
  path = path.split(posix.sep).join(sep)
  path = path.split(win32.sep).join(sep)
  return path
}

export const topLevelFoldersThatMayContainResolvers = ["src", "app", "integrations"]

export function buildPageExtensionRegex(pageExtensions: string[]) {
  return new RegExp(`(?<!\\.test|\\.spec)\\.(?:${pageExtensions.join("|")})$`)
}

const fileExtensionRegex = /\.([a-z]+)$/

export function convertPageFilePathToRoutePath(filePath: string) {
  return filePath
    .replace(/^.*?[\\/]queries[\\/]/, "/")
    .replace(/^.*?[\\/]mutations[\\/]/, "/")
    .replace(fileExtensionRegex, "")
}

export function convertFilePathToResolverName(filePathFromAppRoot: string) {
  return filePathFromAppRoot
    .replace(/^.*[\\/](queries|mutations)[\\/]/, "")
    .replace(fileExtensionRegex, "")
}

export function convertFilePathToResolverType(filePathFromAppRoot: string) {
  return filePathFromAppRoot.match(/[\\/]queries[\\/]/) ? "query" : "mutation"
}

export function getIsRpcFile(filePathFromAppRoot: string) {
  return (
    /[\\/]queries[\\/]/.test(filePathFromAppRoot) || /[\\/]mutations[\\/]/.test(filePathFromAppRoot)
  )
}
