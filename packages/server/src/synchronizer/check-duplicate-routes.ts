import chalk from 'chalk'

export const checkDuplicateRoutes = (entries: string[]) => {
  const allRoutes = entries.filter((route) => route.includes('routes'))
  const cleanRoutes = allRoutes.map((route) => route.split('routes/')[1])
  const duplicateRoutes = cleanRoutes.filter((e, i, a) => a.indexOf(e) !== i)
  const duplicateRoutesIndexes = duplicateRoutes.map((route) =>
    cleanRoutes.flatMap((cleanRoute, i) => (cleanRoute === route ? i : [])),
  )
  const duplicateRoutesPaths = duplicateRoutesIndexes.map((indexes) =>
    indexes.map((index) => allRoutes[index]),
  )

  if (duplicateRoutesPaths.length > 0) {
    console.log(chalk.yellow('Warning: You have created conflicting routes: \n'))

    duplicateRoutesPaths.forEach((route) => {
      route.forEach((path) =>
        console.log(`- ${path.split('routes/')[0]}routes/${chalk.bold.redBright(path.split('routes/')[1])}`),
      )
    })

    process.exit(0)
  }
}
