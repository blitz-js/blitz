import crypto from "crypto"
import {transform} from "../transform"

/**
 * Returns a stage that prepares files coming into the stream
 * with correct event information as well as hash information
 * This is used by the work optimizer and elsewhere to manage the
 * way files are handled and optimized
 */
export function createEnrichFiles() {
  const stream = transform.file((file, {next}) => {
    // Don't send directories
    if (file.isDirectory()) {
      next()
      return
    }

    if (!file.event) {
      file.event = "add"
    }

    if (!file.hash) {
      file.hash = crypto
        .createHash("md5")
        .update(file.path + file.stat?.mtime.toString())
        .digest("hex")
    }

    return file
  })
  return {stream}
}
