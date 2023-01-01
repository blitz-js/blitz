import {assert} from "blitz"
import {posix, sep, win32, join, normalize} from "path"
import {ResolverPathOptions} from "./index-server"

export interface LoaderOptions {
  resolverPath: ResolverPathOptions
  includeRPCFolders?: string[]
}

export interface Loader {
  _compiler?: {
    name: string
    context: string
  }
  resource: string
  cacheable: (enabled: boolean) => void
  query: LoaderOptions
}

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

export function convertPageFilePathToRoutePath({
  absoluteFilePath,
  resolverBasePath,
  appRoot,
  extraRpcBasePaths = [],
}: {
  appRoot: string
  absoluteFilePath: string
  resolverBasePath?: ResolverPathOptions
  extraRpcBasePaths?: string[]
}) {
  let path = normalize(absoluteFilePath)

  if (typeof resolverBasePath === "function") {
    path = resolverBasePath(path)
  } else if (resolverBasePath === "root") {
    path = path.replace(normalize(appRoot), "")
    for (const extraPath of extraRpcBasePaths) {
      path = path.replace(join(normalize(appRoot), extraPath.replace("/", sep)), "")
    }
  } else {
    path = path.replace(/^.*?[\\/]queries[\\/]/, "/").replace(/^.*?[\\/]mutations[\\/]/, "/")
  }

  return path.replace(/\\/g, "/").replace(fileExtensionRegex, "")
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
