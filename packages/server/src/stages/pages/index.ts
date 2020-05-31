import {join} from 'path'
import File from 'vinyl'
import {getDuplicatePaths, absolutePathTransform} from '../utils'
import {through} from '../../streams'
import {Stage} from '@blitzjs/file-pipeline'
import {handleErrors, DuplicatePathError, NestedRouteError} from './errors'

/**
 * Returns a Stage to assemble NextJS `/pages` folder from within
 * the BlitzJS folder structure
 */
export const createStagePages: Stage = ({config, bus, getInputCache}) => {
  const {src} = config

  handleErrors(bus)

  const pagesTransformer = absolutePathTransform(src)(pagesPathTransformer)
  const apiTransformer = absolutePathTransform(src)(apiPathTransformer)

  const stream = through.obj((file: File, _, next) => {
    const entries = getInputCache().toPaths()

    // Check for duplicate pages entries
    const duplicatePages = getDuplicatePaths(entries, 'pages')
    if (duplicatePages.length > 0) {
      const err = new DuplicatePathError(
        'Warning: You have created conflicting page routes:',
        'pages',
        duplicatePages,
      )

      return next(err)
    }

    // Check for duplicate api entries
    const duplicateApi = getDuplicatePaths(entries, 'api')
    if (duplicateApi.length > 0) {
      const err = new DuplicatePathError(
        'Warning: You have created conflicting api routes:',
        'api',
        duplicateApi,
      )

      return next(err)
    }

    const allPages = entries.filter((page) => page.includes('pages'))
    const nestedApiRoutes = allPages.filter((page) => page.includes('/pages/api'))
    if (nestedApiRoutes.length > 0) {
      const message =
        nestedApiRoutes.length === 1
          ? 'Warning: You have tried to put an api route inside a pages directory:'
          : 'Warning: You have tried to put api routes inside a pages directory:'

      const secondary = `API routes should be in their own 'api/' folder as a sibling of 'pages/':
- Examples: app/api/, app/products/api/
`

      const err = new NestedRouteError(message, secondary, nestedApiRoutes)

      return next(err)
    }

    file.path = apiTransformer(pagesTransformer(file.path))

    next(null, file)
  })

  return {stream}
}

export function pagesPathTransformer(path: string) {
  const regex = /(?:[\\/]?app[\\/].*?[\\/]?)(pages[\\/].+)$/
  return (regex.exec(path) || [])[1] || path
}

export function apiPathTransformer(path: string) {
  const regex = /(?:[\\/]?app[\\/].*?[\\/]?)(api[\\/].+)$/
  const matchedPath = (regex.exec(path) || [])[1]

  return matchedPath ? join('pages', matchedPath) : path
}
