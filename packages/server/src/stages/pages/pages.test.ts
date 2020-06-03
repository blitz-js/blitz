import {createStagePages} from '.'
import through2 from 'through2'
import File from 'vinyl'
import {FileCache} from '@blitzjs/file-pipeline'
import {StageConfig, StageArgs} from '@blitzjs/file-pipeline/dist/packages/file-pipeline/src/types'
import {DuplicatePathError} from './errors'
import {normalize} from 'path'

function getStreamWithInputCache(entries: string[]) {
  const config: StageConfig = {dest: '', cwd: '', ignore: [], include: [], src: '', watch: false}
  const args: StageArgs = {
    getInputCache() {
      return ({
        toPaths() {
          return entries
        },
      } as any) as FileCache
    },
    bus: through2.obj(),
    input: through2.obj(),
    config,
  }
  return createStagePages(args).stream
}

describe('createStagePages', () => {
  it('should throw an error when there are duplicates', (done) => {
    const stream = getStreamWithInputCache([normalize('app/api/foo'), normalize('app/api/foo')])
    stream.on('error', (err) => {
      expect(err.message).toContain('conflicting api routes:')
      done()
    })

    // The check happens while files are being consumed so we need to pass a file
    stream.write(new File({path: 'foo', content: 'bar'}))
  })

  it('should throw an error when there are duplicate pages', (done) => {
    const stream = getStreamWithInputCache([
      normalize('app/foo/pages/bar'),
      normalize('app/pages/bar'),
      normalize('pages/bar'),
    ])
    stream.on('error', (err) => {
      expect(err.message).toContain('conflicting page routes:')
      expect(err.paths).toEqual([
        [normalize('app/foo/pages/bar'), normalize('app/pages/bar'), normalize('pages/bar')],
      ])
      done()
    })

    // The check happens while files are being consumed so we need to pass a file
    stream.write(new File({path: 'foo', content: 'bar'}))
  })

  it('should throw an error when there are duplicate api routes from both in pages and out', (done) => {
    const stream = getStreamWithInputCache([normalize('app/pages/api/bar'), normalize('app/api/bar')])
    stream.on('error', (err: DuplicatePathError) => {
      expect(err.message).toContain('conflicting api routes:')
      expect(err.paths).toEqual([[normalize('app/pages/api/bar'), normalize('app/api/bar')]])
      done()
    })

    // The check happens while files are being consumed so we need to pass a file
    stream.write(new File({path: 'foo', content: 'bar'}))
  })

  it('should not throw an error when there are nested api routes', (done) => {
    const stream = getStreamWithInputCache([normalize('app/pages/foo/api/bar'), normalize('app/api/bar')])
    stream.on('error', () => {
      expect(true).toBe('This should not have been called')
      done()
    })

    // The check happens while files are being consumed so we need to pass a file
    stream.write(new File({path: 'foo', content: 'bar'}))
    setImmediate(done)
  })
})
