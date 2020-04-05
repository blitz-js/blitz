import through from 'through2'
import File from 'vinyl'

export function transform(fn: (f: File, e: string) => File) {
  return through.obj((file: File, encoding, done) => {
    done(null, fn(file, encoding))
  })
}
