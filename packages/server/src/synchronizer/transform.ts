import through from 'through2'
import File from 'vinyl'

// Accept a function to transform the stream
// If the function returns an array of files add all subsequent files to the stream
// If you return an empty array the file will be deleted from the stream
export function transform(fn: (f: File, e: string) => File | File[]) {
  return through.obj(function (file: File, encoding, done) {
    const ret = fn(file, encoding)
    const files = Array.isArray(ret) ? ret : [ret]
    for (file of files) {
      this.push(file)
    }
    done()
  })
}
