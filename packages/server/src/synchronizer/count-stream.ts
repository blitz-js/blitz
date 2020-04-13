import through from 'through2'

export const countStream = (cb: (count: number) => void) => {
  let count = 0
  return through.obj((_, __, next) => {
    cb(++count)
    next()
  })
}
