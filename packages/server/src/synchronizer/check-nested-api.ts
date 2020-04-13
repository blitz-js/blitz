import chalk from 'chalk'

export const checkNestedApi = (entries: string[]) => {
  const allPages = entries.filter((page) => page.includes('pages'))
  const nestedApiRoutes = allPages.filter((page) => page.includes('/pages/api'))

  if (nestedApiRoutes.length > 0) {
    if (nestedApiRoutes.length === 1) {
      console.log(chalk.yellow('Warning: You have tried to put an api route inside a pages directory: \n'))
    } else {
      console.log(chalk.yellow('Warning: You have tried to put api routes inside a pages directory: \n'))
    }

    nestedApiRoutes.forEach((route) => {
      console.log(`- ${route}`)
    })

    console.log(chalk.yellow('\n All api routes should be in their own directory.'))

    process.exit(0)
  }
}
