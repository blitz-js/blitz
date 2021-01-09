import gulpIf from "gulp-if"
import {Writable} from "stream"
import File from "vinyl"
import {dest} from "vinyl-fs"
import {FILE_DELETED, FILE_WRITTEN} from "../../events"
import {pipeline} from "../../streams"
import {transform} from "../../transform"
import {isFile} from "../../utils"
import {unlink} from "../unlink"

const isUnlinkFile = (file: File) => {
  return file.event === "unlink" || file.event === "unlinkDir"
}

/**
 * Returns a Stage that writes files to the destination path
 */
export const createWrite = (
  destination: string,
  reporter: Writable,
  // Allow the writer to be overriden
  writeStream = dest(destination),
  unlinkStream = unlink(destination),
) => {
  const splitToBus = transform.file((file) => {
    reporter.write({type: isUnlinkFile(file) ? FILE_DELETED : FILE_WRITTEN, payload: file})
    return file
  })

  const stream = gulpIf(
    isFile,
    gulpIf(isUnlinkFile, pipeline(unlinkStream, splitToBus), pipeline(writeStream, splitToBus)),
  )

  return {stream}
}
