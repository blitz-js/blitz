import {through} from '../../streams'
import File from 'vinyl'

type FileCacheEntry = {path: string}

export class FileCache {
  fileCache: Record<string, FileCacheEntry> = {}

  delete(file: File) {
    delete this.fileCache[file.path]
  }

  add(file: File) {
    this.fileCache[file.path] = {path: file.path}
  }

  filterByPath(filterFn: (a: string) => boolean) {
    let found = []
    for (let path in this.fileCache) {
      if (filterFn(path)) {
        found.push(this.fileCache[path])
      }
    }
    return found
  }

  filter(filterFn: (a: FileCacheEntry) => boolean) {
    let found = []
    for (let path in this.fileCache) {
      if (filterFn(this.fileCache[path])) {
        found.push(this.fileCache[path])
      }
    }
    return found
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
export default (filter: (a: File) => boolean = () => true) => {
  const cache = FileCache.create()

  const stream = through({objectMode: true, highWaterMark: 1}, (file, _, next) => {
    // Don't cache files that dont match the filter
    if (!filter(file)) {
      return next(null, file)
    }

    if (file.event === 'unlink') {
      cache.delete(file)
    } else {
      cache.add(file)
    }

    next(null, file)
  })

  return {stream, cache}
}
