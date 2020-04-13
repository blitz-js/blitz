import {Rule} from './types'
import through from 'through2'
import File from 'vinyl'

export function runRule(fn: Rule) {
  return through.obj(function(file: File, encoding, done) {
    const ret = fn(file, encoding)
    const files = Array.isArray(ret) ? ret : [ret]
    for (file of files) {
      this.push(file)
    }
    done()
  })
}
