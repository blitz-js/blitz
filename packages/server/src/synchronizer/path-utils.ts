import {relative, resolve} from 'path'

// Transform an absolute path with a relative path transformer
export function absolutePathTransform(sourceFolder = '', transformer: (s: string) => string) {
  return (filePath: string) => {
    const startingPath = relative(sourceFolder, filePath)
    const transformedPath = transformer(startingPath)
    return resolve(sourceFolder, transformedPath)
  }
}
