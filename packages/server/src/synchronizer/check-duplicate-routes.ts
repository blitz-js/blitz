import {error, variable} from '../log'

const getDuplicatePaths = (entries: string[], type: string) => {
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

const buildErrorMessage = (path: string, type: string) =>
  `- ${path.split(`${type}/`)[0]}${type}/${variable(path.split(`${type}/`)[1])}`

export const checkDuplicateRoutes = (entries: string[]) => {
  const duplicateApiRoutesPaths = getDuplicatePaths(entries, 'api')
  const duplicatePagesPaths = getDuplicatePaths(entries, 'pages')

  if (duplicateApiRoutesPaths.length > 0) {
    error('Warning: You have created conflicting api routes:')

    duplicateApiRoutesPaths.forEach((route) => {
      route.forEach((path) => console.log(buildErrorMessage(path, 'api')))
    })
  }

  if (duplicatePagesPaths.length > 0) {
    error('Warning: You have created conflicting pages:')

    duplicatePagesPaths.forEach((page) => {
      page.forEach((path) => console.log(buildErrorMessage(path, 'pages')))
    })

    process.exit(0)
  }
}
