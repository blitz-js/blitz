import {error} from '../log'

export const checkNestedApi = (entries: string[]) => {
  const allPages = entries.filter((page) => page.includes('pages'))
  const nestedApiRoutes = allPages.filter((page) => page.includes('/pages/api'))

  if (nestedApiRoutes.length > 0) {
    if (nestedApiRoutes.length === 1) {
      error('Warning: You have tried to put an api route inside a pages directory:')
    } else {
      error('Warning: You have tried to put api routes inside a pages directory:')
    }

    nestedApiRoutes.forEach((route) => {
      console.log(`- ${route}`)
    })

    error('All api routes should be in their own directory.')

    process.exit(0)
  }
}
