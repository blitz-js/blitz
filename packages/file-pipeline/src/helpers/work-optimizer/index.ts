// Mostly concerned with solving the Dirty Sync problem
import {log} from "@blitzjs/display"
import {transform} from "../../transform"

import debounce from "lodash/debounce"
import {writeFile, existsSync, readFileSync} from "fs-extra"
import {resolve, relative} from "path"
import File from "vinyl"

const defaultSaveCache = debounce((filePath: string, data: object) => {
  return writeFile(filePath, Buffer.from(JSON.stringify(data, null, 2)))
    .then(() => {})
    .catch(() => {})
}, 500)

const defaultReadCache = (filePath: string) => {
  // We need to do sync file reading here as this cache
  // must be loaded before the stream is added to the pipeline
  // or we end up with more complexity having to cache files as they come in
  return existsSync(filePath) ? readFileSync(filePath).toString() : ""
}

/**
 * Returns streams that help handling work optimisation in the file transform stream.
 */
export function createWorkOptimizer(
  src: string,
  dest: string,
  saveCache: (filePath: string, data: object) => Promise<void> = defaultSaveCache,
  readCache: (filePath: string) => string = defaultReadCache,
) {
  const getOriginalPath = (file: File) => {
    return relative(src, file.history[0])
  }
  const doneCacheLocation = resolve(dest, ".blitz.incremental.cache.json")

  const doneStr = readCache(doneCacheLocation)
  console.log({doneStr})
  const todo: Record<string, string> = {}
  const done: Record<string, string> = doneStr ? JSON.parse(doneStr) : {}

  const stats = {todo, done}

  const reportComplete = transform.file(async (file) => {
    const origPath = getOriginalPath(file)

    delete todo[origPath]

    if (file.event === "add") {
      done[origPath] = file.hash
    }

    if (file.event === "unlink") {
      delete done[origPath]
    }

    await saveCache(resolve(dest, ".blitz.incremental.cache.json"), done)

    return file
  })

  const triage = transform.file((file, {push, next}) => {
    const origPath = getOriginalPath(file)

    if (!file.hash) {
      log.debug("File does not have hash! " + file.path)
      return next()
    }

    // Dont send files that have already been done or have already been added
    if (done[origPath] === file.hash || todo[origPath] === file.hash) {
      log.debug("Rejecting because this job has been done before: " + file.path)
      return next()
    }

    todo[origPath] = file.hash

    push(file)

    next()
  })

  return {triage, reportComplete, stats}
}
