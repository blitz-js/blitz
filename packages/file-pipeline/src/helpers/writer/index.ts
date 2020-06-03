import {pipeline} from '../../streams'
import gulpIf from 'gulp-if'
import {unlink} from '../unlink'
import {dest} from 'vinyl-fs'
import File from 'vinyl'
import {FILE_WRITTEN, FILE_DELETED} from '../../events'
import {Writable} from 'stream'
import {isFile} from '../../utils'
import {transform} from '../../transform'
/**
 * Returns a Stage that writes files to the destination path
 */
export const createWrite = (
  destination: string,
  reporter: Writable,
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

const isUnlinkFile = (file: File) => file.event === 'unlink' || file.event === 'unlinkDir'
