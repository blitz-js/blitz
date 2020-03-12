import {unlink} from 'fs-extra'
import through from 'through2'
import * as File from 'vinyl'
import {relative, resolve} from 'path'
import Pumpify from 'pumpify'
import {dest as gulpDest} from 'vinyl-fs'

function getDestPath(folder: string, file: File) {
  const {history, cwd} = file
  const [firstPath] = history
  return resolve(folder, relative(cwd, firstPath))
}

export function dest(folder: string) {
  return new Pumpify.obj(
    through.obj(async (file: File, _encoding, done) => {
      if (file.event === 'unlink' || file.event === 'unlinkDir') {
        await unlink(getDestPath(folder, file))
      }

      done(null, file)
    }),
    gulpDest(folder),
  )
}
