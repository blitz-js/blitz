import {through} from '../../streams'
import vfs from 'vinyl-fs'
import mergeStream from 'merge-stream'

import File from 'vinyl'
import chokidar from 'chokidar'
import vinyl from 'vinyl-file'
import {Stats} from 'fs'
import {normalize, resolve, isAbsolute} from 'path'

export const watch = (includePaths: string[] | string, options: chokidar.WatchOptions) => {
  function resolveFilepath(filepath: string) {
    if (isAbsolute(filepath)) {
      return normalize(filepath)
    }
    return resolve(options.cwd || process.cwd(), filepath)
  }

  const stream = through({objectMode: true}, (f, _, next) => {
    next(f)
  })

  function processEvent(evt: string) {
    return async (filepath: string, _stat: Stats) => {
      filepath = resolveFilepath(filepath)

      const fileOpts = Object.assign({}, options, {path: filepath})
      const file =
        evt === 'unlink' || evt === 'unlinkDir' ? new File(fileOpts) : await vinyl.read(filepath, fileOpts)

      file.event = evt
      stream.push(file)
    }
  }

  const fswatcher = chokidar.watch(includePaths, options)
  fswatcher.on('add', processEvent('add'))
  fswatcher.on('change', processEvent('change'))
  fswatcher.on('unlink', processEvent('unlink'))

  return {stream, fswatcher}
}

type SourceConfig = {cwd: string; include: string[]; ignore: string[]; watch: boolean}

/**
 * A stage that will provide agnostic file input based on a set of globs.
 * Initially it will start as a vinyl stream and if the watch config is
 * set to true it will also provide a file watcher.
 * @param config Config object
 */
export function agnosticSource({ignore, include, cwd, watch: watching = false}: SourceConfig) {
  const noop = through({objectMode: true}, () => {})

  const vinylFsStream = vfs.src([...include, ...ignore.map((a) => '!' + a)], {
    buffer: true,
    read: true,
    cwd,
  })
  const watcher = watch(include, {
    cwd,
    ignored: ignore,
    persistent: true,
    ignoreInitial: true,
    alwaysStat: true,
  })

  const watchStream = watching ? watcher.stream : noop

  const stream = mergeStream(vinylFsStream, watchStream) as NodeJS.ReadWriteStream

  vinylFsStream.on('end', () => {
    // Send ready event when our initial scan of the folder is done
    stream.write('ready')
  })

  stream.on('end', () => {
    watcher.fswatcher.close()
  })
  return {stream}
}
