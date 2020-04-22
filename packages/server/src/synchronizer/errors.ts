import {error, variable} from '../log'
import {through} from './streams'
import {Writable} from 'stream'
import {ERROR_THROWN} from './reporter'

export type Event<T> = {type: string; payload: T}

type Error = DuplicatePathError | NestedRouteError

/**
 * Returns an object with a stream that takes operational errors and prepares them for the console.
 */
export default function createErrorsStream(reporter: Writable) {
  const stream = through({objectMode: true}, (err: Error, _, next) => {
    reporter.write({type: ERROR_THROWN, payload: err})

    if (err instanceof DuplicatePathError) {
      renderDuplicatePathError(err)
      return next()
    }

    if (err instanceof NestedRouteError) {
      renderNestedRouteError(err)
      return next()
    }

    next(err)
  })

  return {stream}
}

export class DuplicatePathError extends Error {
  name = 'DuplicatePathError'
  constructor(public message: string, public pathType: string, public paths: string[][]) {
    super(message)
  }
}

const removeCwd = (path: string) => path.replace(process.cwd(), '')

const renderErrorMessage = (path: string, type: string) =>
  `- ${path.split(`${type}/`)[0]}${type}/${variable(path.split(`${type}/`)[1])}`

export function renderDuplicatePathError(err: DuplicatePathError) {
  error(err.message)

  err.paths.forEach((page) => {
    page.forEach((path) => console.log(renderErrorMessage(removeCwd(path), err.pathType)))
  })
}

export class NestedRouteError extends Error {
  name = 'NestedRouteError'
  constructor(public message: string, public secondary: string, public routes: string[]) {
    super(message)
  }
}

export function renderNestedRouteError(err: NestedRouteError) {
  error(err.message)

  process.stdout.write('\n')

  err.routes.forEach((route) => {
    console.log(`- ${removeCwd(route)}`)
  })

  process.stdout.write('\n')

  error(err.secondary)
}
