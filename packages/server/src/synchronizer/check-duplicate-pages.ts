import chalk from 'chalk'

export const checkDuplicatePages = (entries: string[]) => {
  const allPages = entries.filter((page) => page.includes('pages'))
  const cleanPages = allPages.map((page) => page.split('pages/')[1])
  const duplicatePages = cleanPages.filter((e, i, a) => a.indexOf(e) !== i)
  const duplicatePagesIndexes = duplicatePages.map((page) =>
    cleanPages.flatMap((cleanPage, i) => (cleanPage === page ? i : [])),
  )
  const duplicatePagesPaths = duplicatePagesIndexes.map((indexes) => indexes.map((index) => allPages[index]))

  if (duplicatePagesPaths.length > 0) {
    console.log(chalk.yellow('Warning: You have created conflicting pages: \n'))

    duplicatePagesPaths.forEach((page) => {
      page.forEach((path) =>
        console.log(`- ${path.split('pages/')[0]}pages/${chalk.bold.redBright(path.split('pages/')[1])}`),
      )
    })

    process.exit(0)
  }
}
