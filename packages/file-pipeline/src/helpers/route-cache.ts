import File from "vinyl"
import {RouteCacheEntry, RouteCacheInterface, RouteType, RouteVerb} from "../types"

export class RouteCache implements RouteCacheInterface {
  routeCache: Record<string, RouteCacheEntry> = {}

  delete(file: File) {
    delete this.routeCache[file.path]
  }

  getUrifromPath(path: string) {
    const findStr = "/pages"
    const findStrIdx = path.indexOf(findStr)
    return path.substring(findStrIdx + findStr.length, path.lastIndexOf("."))
  }

  getVerb(type: RouteType): RouteVerb {
    switch (type) {
      case "api":
        return "any"
      case "rpc":
        return "post"
      default:
        return "get"
    }
  }

  add(file: File, type: RouteType) {
    this.routeCache[file.path] = {
      uri: this.getUrifromPath(file.path),
      verb: this.getVerb(type),
      type,
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
    this.routeCache[key] = value
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
