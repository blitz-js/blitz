import File from 'vinyl'
import chokidar from 'chokidar'
import {Readable} from 'readable-stream'
import vinyl from 'vinyl-file'
import {Stats} from 'fs'
import {normalize, resolve} from 'path'
import pathIsAbsolute from 'path-is-absolute'

export const watch = (includePaths: string[] | string, options: chokidar.WatchOptions) => {
  function resolveFilepath(filepath: string) {
    if (pathIsAbsolute(filepath)) {
      return normalize(filepath)
    }
    return resolve(options.cwd || process.cwd(), filepath)
  }

  const stream = new Readable({
    objectMode: true,
    read() {},
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

  const watcher = chokidar.watch(includePaths, options)
  watcher.on('add', processEvent('add'))
  watcher.on('change', processEvent('change'))
  watcher.on('unlink', processEvent('unlink'))

  return {stream, watcher}
}
