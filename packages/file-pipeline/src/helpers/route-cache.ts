import File from "vinyl"
import {RouteCacheEntry, RouteCacheInterface, RouteType, RouteVerb} from "../types"

export class RouteCache implements RouteCacheInterface {
  routeCache: Record<string, RouteCacheEntry> = {}

  delete(file: File) {
    delete this.routeCache[file.originalRelative]
  }

  getUrifromPath(path: string) {
    const findStr = "/pages"
    const findStrIdx = path.indexOf(findStr)
    const uri = path.substring(findStrIdx + findStr.length, path.lastIndexOf("."))
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
    if (uri.length === 4) {
      // need better way to check HTTP error code
      const regex = /^[1-5][0-9][0-9]$/
      return regex.test(uri.substring(1))
    }
    return false
  }

  add(file: File, type: RouteType) {
    const uri = this.getUrifromPath(file.path)
    const isErrorCode = this.isErrorCode(uri)
    if (!isErrorCode) {
      this.routeCache[file.originalRelative] = {
        path: file.originalRelative,
        uri,
        verb: this.getVerb(type),
        type,
      }
    }
  }

  filterByPath(filterFn: (a: string) => boolean) {
    let found = []
    for (let path in this.routeCache) {
      if (filterFn(path)) {
        found.push(this.routeCache[path])
      }
    }
    return found
  }

  filter(filterFn: (a: RouteCacheEntry) => boolean) {
    let found = []
    for (let path in this.routeCache) {
      if (filterFn(this.routeCache[path])) {
        found.push(this.routeCache[path])
      }
    }
    return found
  }

  get(): Record<string, RouteCacheEntry>
  get(key: string): RouteCacheEntry
  get(key?: string) {
    if (key) return this.routeCache[key]
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
    return new RouteCache()
  }
}

/**
 * Provides a route cache of the files running through the stream
 */
export function createRouteCache() {
  const cache = RouteCache.create()
  return {cache}
}
