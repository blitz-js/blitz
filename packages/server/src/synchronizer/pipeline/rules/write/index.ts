import {through, pipeline} from '../../../streams'
import gulpIf from 'gulp-if'
import {unlink} from '../../helpers/unlink'
import {dest} from 'vinyl-fs'
import File from 'vinyl'
import {Rule} from '../../../types'
import {FILE_WRITTEN} from '../../../reporter'

/**
 * Returns a Rule that writes files to the destination path
 */
const create: Rule = ({config, reporter}) => {
  const stream = pipeline(
    gulpIf(isUnlinkFile, unlink(config.dest), dest(config.dest)),
    through({objectMode: true}, (file: File, _, next) => {
      reporter.write({type: FILE_WRITTEN, payload: file})
      next(null, file)
    }),
  )

  return {stream}
}

export default create

const isUnlinkFile = (file: File) => file.event === 'unlink' || file.event === 'unlinkDir'
