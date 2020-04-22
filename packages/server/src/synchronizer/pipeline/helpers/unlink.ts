import {unlink as unlinkFile, pathExists} from 'fs-extra'
import through from 'through2'
import * as File from 'vinyl'
import {relative, resolve} from 'path'

function getDestPath(folder: string, file: File) {
  const {history, cwd} = file
  const [firstPath] = history
  return resolve(folder, relative(cwd, firstPath))
}

/**
 * Deletes a file in the stream from the filesystem
 * @param folder The destination folder
 */
export function unlink(folder: string) {
  return through.obj(async (file: File, _encoding, done) => {
    if (file.event === 'unlink' || file.event === 'unlinkDir') {
      if (await pathExists(getDestPath(folder, file))) await unlinkFile(getDestPath(folder, file))
    }

    done(null, file)
  })
}
