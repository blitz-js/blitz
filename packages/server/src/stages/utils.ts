import {relative, resolve} from "path"

// Transform an absolute path with a relative path transformer
export const absolutePathTransform = (sourceFolder = "") => (
  relativeTransformer: (s: string) => string,
) => (filePath: string) => {
  const startingPath = relative(sourceFolder, filePath)
  const transformedPath = relativeTransformer(startingPath)
  return resolve(sourceFolder, transformedPath)
}
