import * as fs from "fs-extra"
import {relative, resolve} from "path"
import {EventedFile} from "types"
import {transform} from "../../transform"

function getDestPath(folder: string, file: EventedFile) {
  return resolve(folder, relative(file.cwd, file.path))
}

/**
 * Deletes a file in the stream from the filesystem
 * @param folder The destination folder
 */
export function unlink(folder: string, unlinkFile = fs.unlink, pathExists = fs.pathExists) {
  return transform.file(async (file) => {
    if (file.event === "unlink" || file.event === "unlinkDir") {
      const destPath = getDestPath(folder, file)
      if (await pathExists(destPath)) await unlinkFile(destPath)
    }

    return file
  })
}
