import {relative, resolve} from "path"
import {transform} from "../../transform"
import {EventedFile} from "../../types"
import {rimraf} from "../rimraf-promise"

function getDestPath(folder: string, file: EventedFile) {
  return resolve(folder, relative(file.cwd, file.path))
}

/**
 * Deletes a file in the stream from the filesystem
 * @param folder The destination folder
 */
export function unlink(folder: string, unlinkFile = rimraf) {
  return transform.file(async (file) => {
    if (file.event === "unlink" || file.event === "unlinkDir") {
      const destPath = getDestPath(folder, file)
      await unlinkFile(destPath, {glob: false})
    }

    return file
  })
}
