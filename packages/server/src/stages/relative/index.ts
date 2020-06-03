import File from 'vinyl'
import {through} from '../../streams'
import {Stage} from '@blitzjs/file-pipeline'
import path from 'path'
import slash from 'slash'

/**
 * Returns a Stage that converts relative files paths to absolute
 */
export const createStageRelative: Stage = () => {
  const stream = through({objectMode: true}, (file: File, _, next) => {
    const cwd = process.cwd()
    const filecontents = file.contents
    const filepath = file.path

    if (!isInAppFolder(filepath, cwd) || filecontents === null) {
      return next(null, file)
    }

    const contents = filecontents.toString()

    const newContents = replaceRelativeImports(contents, relativeToAbsolute(cwd, filepath))
    file.contents = Buffer.from(newContents)

    next(null, file)
  })

  return {stream}
}

const isInAppFolder = (s: string, cwd: string) => s.replace(cwd + path.sep, '').indexOf('app') === 0

export const patternRelativeImport = /(from\s+(?:['"]))(\.[^'"]+)(['"])/g

export function replaceRelativeImports(content: string, replacer: (s: string) => string) {
  return content.replace(patternRelativeImport, (...args) => {
    const [, start, importPath, end] = args
    return [start, replacer(importPath), end].join('')
  })
}

export function relativeToAbsolute(_cwd: string, _filename: string) {
  return (filePath: string) => {
    if (filePath.indexOf('.') !== 0) return filePath

    return slash(path.join(path.dirname(_filename), filePath).replace(_cwd + path.sep, ''))
  }
}
