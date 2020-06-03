import {through, pipeline} from '../streams'
import gulpIf from 'gulp-if'
import {unlink} from './unlink'
import {dest} from 'vinyl-fs'
import File from 'vinyl'
import {FILE_WRITTEN} from '../events'
import {Writable} from 'stream'

/**
 * Returns a Stage that writes files to the destination path
 */
export const createWrite = (destination: string, reporter: Writable) => {
  const stream = pipeline(
    gulpIf(isUnlinkFile, unlink(destination), dest(destination)),
    through({objectMode: true}, (file: File, _, next) => {
      reporter.write({type: FILE_WRITTEN, payload: file})
      next(null, file)
    }),
  )

  return {stream}
}

const isUnlinkFile = (file: File) => file.event === 'unlink' || file.event === 'unlinkDir'
