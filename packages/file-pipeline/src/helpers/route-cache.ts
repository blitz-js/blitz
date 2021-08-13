import {convertPageFilePathToRoutePath, getIsRpcFile} from "next/dist/build/utils"
import path from "path"
import File from "vinyl"
import {RouteCacheEntry, RouteCacheInterface, RouteType, RouteVerb} from "../types"

export class RouteCache implements RouteCacheInterface {
  static singleton: RouteCache | null = null

  routeCache: Record<string, RouteCacheEntry> = {}
  lengthOfHTTPErrorURI = 4

  normalizePath(input: string) {
    if (path.sep === path.posix.sep) return input
    return input.split(path.sep).join(path.posix.sep)
  }

  getUrifromPath(path: string) {
    let uri = path
    let findStr = "/pages"
    let findStrIdx = path.indexOf(findStr)
    if (findStrIdx >= 0) {
      uri = path.substring(findStrIdx + findStr.length, path.lastIndexOf("."))
    } else {
      findStr = "/api"
      findStrIdx = path.indexOf(findStr)
      uri = "/api" + path.substring(findStrIdx + findStr.length, path.lastIndexOf("."))
    }

    const uriWithoutIndex = uri.replace("/index", "")
    return uriWithoutIndex.length > 0 ? uriWithoutIndex : "/"
  }

  getVerb(type: RouteType): RouteVerb {
    switch (type) {
      case "api":
        return "*"
      case "rpc":
        return "post"
      default:
        return "get"
    }
  }

  isErrorCode(uri: string) {
    if (uri.length === this.lengthOfHTTPErrorURI) {
      // need better way to check HTTP error code
      const regex = /^[1-5][0-9][0-9]$/
      return regex.test(uri.substring(1))
    }
    return false
  }

  private getType(file: File): RouteType | null {
    const pagesPathRegex = /(pages[\\/][^_.].+(?<!\.test)\.(m?[tj]sx?|mdx))$/
    const apiPathRegex = /(api[\\/].+\.[tj]s)$/

    if (getIsRpcFile(file.path)) {
      return "rpc"
    } else if (apiPathRegex.test(file.path)) {
      return "api"
    } else if (pagesPathRegex.test(file.path)) {
      return "page"
    }

    return null
  }

  add(file: File) {
    const srcPath = file.originalRelative ?? file.relative
    if (this.routeCache[srcPath]) return

    const type = this.getType(file)
    if (!type) {
      return
    }

    let uri
    if (type === "rpc") {
      // TODO - load page extensions from user config
      uri = convertPageFilePathToRoutePath(file.path, ["tsx", "ts", "jsx", "js"])
    } else {
      uri = this.getUrifromPath(this.normalizePath(file.path))
    }
    const isErrorCode = this.isErrorCode(uri)
    if (!isErrorCode) {
      this.routeCache[srcPath] = {
        path: srcPath,
        uri,
        verb: this.getVerb(type),
        type,
      }
    }
  }

  delete(file: File) {
    const srcPath = file.originalRelative ?? file.relative
    delete this.routeCache[srcPath]
  }

  filterByPath(filterFn: (givenPath: string) => boolean) {
    return Object.entries(this.routeCache)
      .filter(([path]) => filterFn(path))
      .map(([_path, entry]) => entry)
  }

  filter(filterFn: (entry: RouteCacheEntry) => boolean) {
    return Object.values(this.routeCache).filter(filterFn)
  }

  get(): Record<string, RouteCacheEntry>
  get(key: string): RouteCacheEntry
  get(file: File): RouteCacheEntry
  get(key?: string | File) {
    if (typeof key === "string") return this.routeCache[key]
    const srcPath = key?.originalRelative ?? key?.relative
    if (srcPath) return this.routeCache[srcPath]
    return this.routeCache
  }

  set(key: string, value: RouteCacheEntry) {
    this.routeCache[key] = {
      ...value,
      path: value.path ?? "-",
    }
  }

  toString() {
    return JSON.stringify(this.routeCache, null, 2)
  }

  toArray() {
    return Object.values(this.routeCache)
  }

  static create() {
    if (RouteCache.singleton) return RouteCache.singleton
    RouteCache.singleton = new RouteCache()
    return RouteCache.singleton
  }
}

/**
 * Provides a route cache of the files running through the stream
 */
export function createRouteCache() {
  const cache = RouteCache.create()
  return {cache}
}
