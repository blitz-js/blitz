import File from "vinyl"
import {transform} from "../transform"
import {FileCacheEntry, FileCacheInterface} from "../types"
import {isEvent} from "../utils"
export class FileCache implements FileCacheInterface {
  fileCache: Record<string, FileCacheEntry> = {}

  delete(file: File) {
    delete this.fileCache[file.path]
  }

  add(file: File) {
    this.fileCache[file.path] = {path: file.path}
  }

  filterByPath(filterFn: (a: string) => boolean) {
    return Object.entries(this.fileCache)
      .filter(([path]) => filterFn(path))
      .map(([_path, entry]) => entry)
  }

  filter(filterFn: (a: FileCacheEntry) => boolean) {
    return Object.values(this.fileCache).filter(filterFn)
  }

  toString() {
    return JSON.stringify(this.fileCache)
  }

  toPaths() {
    return Object.keys(this.fileCache)
  }

  static create() {
    return new FileCache()
  }
}

/**
 * Provides a file cache of the files running through the stream
 * The cache can be used elsewhere in the stream for dynamic analysis
 * of multiple files.
 */
export function createFileCache(filter: (a: File) => boolean = () => true) {
  const cache = FileCache.create()

  const stream = transform.file(
    (file, {next}) => {
      if (isEvent(file)) return next(null, file)
      // Don't cache files that dont match the filter
      if (!filter(file)) {
        return next(null, file)
      }

      if (file.event === "unlink") {
        cache.delete(file)
      } else {
        cache.add(file)
      }

      next(null, file)
    },
    {objectMode: true, highWaterMark: 1},
  )

  return {stream, cache}
}
