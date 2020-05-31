import {relative, resolve} from 'path'

// Transform an absolute path with a relative path transformer
export const absolutePathTransform = (sourceFolder = '') => (relativeTransformer: (s: string) => string) => (
  filePath: string,
) => {
  const startingPath = relative(sourceFolder, filePath)
  const transformedPath = relativeTransformer(startingPath)
  return resolve(sourceFolder, transformedPath)
}

export const getDuplicatePaths = (entries: string[], type: string) => {
  const allRoutes = entries.filter((route) => route.includes(type))
  const cleanRoutes = allRoutes.map((route) => route.split(`${type}`)[1])
  const duplicateRoutes = cleanRoutes.filter((e, i, a) => a.indexOf(e) !== i)
  const duplicateRoutesIndexes = duplicateRoutes.map((route) =>
    cleanRoutes.flatMap((cleanRoute, i) => (cleanRoute === route ? i : [])),
  )
  const duplicateRoutesPaths = duplicateRoutesIndexes.map((indexes) =>
    indexes.map((index) => allRoutes[index]),
  )

  return duplicateRoutesPaths
}
