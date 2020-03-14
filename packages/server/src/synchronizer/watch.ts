import gulpWatch from 'gulp-watch'

export const watch = (includePaths: string[], options: any): NodeJS.ReadableStream => {
  return gulpWatch(includePaths, options)
}
