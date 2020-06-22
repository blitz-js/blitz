import {unlink as unlinkFile, pathExists} from "fs-extra"

import {relative, resolve} from "path"
import {transform} from "../transform"
import {EventedFile} from "types"

function getDestPath(folder: string, file: EventedFile) {
  const {history, cwd} = file
  const [firstPath] = history
  return resolve(folder, relative(cwd, firstPath))
}

/**
 * Deletes a file in the stream from the filesystem
 * @param folder The destination folder
 */
export function unlink(folder: string) {
  return transform.file(async (file) => {
    if (file.event === "unlink" || file.event === "unlinkDir") {
      if (await pathExists(getDestPath(folder, file))) await unlinkFile(getDestPath(folder, file))
    }

    return file
  })
}
