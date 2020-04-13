import chalk from 'chalk'

export const checkDuplicateApiRoutes = (entries: string[]) => {
  const allApiRoutes = entries.filter((page) => page.includes('api'))
  const cleanApiRoutes = allApiRoutes.map((page) => page.split('api/')[1])
  const duplicateApiRoutes = cleanApiRoutes.filter((e, i, a) => a.indexOf(e) !== i)
  const duplicateApiRoutesIndexes = duplicateApiRoutes.map((apiRoute) =>
    cleanApiRoutes.flatMap((cleanApiRoute, i) => (cleanApiRoute === apiRoute ? i : [])),
  )
  const duplicateApiRoutesPaths = duplicateApiRoutesIndexes.map((indexes) =>
    indexes.map((index) => allApiRoutes[index]),
  )

  if (duplicateApiRoutesPaths.length > 0) {
    console.log(chalk.yellow('Warning: You have created conflicting api routes: \n'))

    duplicateApiRoutesPaths.forEach((apiRoute) => {
      apiRoute.forEach((path) =>
        console.log(`- ${path.split('api/')[0]}api/${chalk.bold.redBright(path.split('api/')[1])}`),
      )
    })

    process.exit(0)
  }
}
