import {log} from '@blitzjs/display'
import {Writable} from 'stream'
import {ERROR_THROWN} from '@blitzjs/synchronizer'

export type Event<T> = {type: string; payload: T}

type Error = DuplicatePathError | NestedRouteError

export function handleErrors(reporter: Writable) {
  reporter.on('data', (event: Event<Error>) => {
    if (event.type !== ERROR_THROWN) return
    const err = event.payload as Error
    if (err instanceof DuplicatePathError) {
      renderDuplicatePathError(err)
      return
    }

    if (err instanceof NestedRouteError) {
      renderNestedRouteError(err)
      return
    }
  })
}

export class DuplicatePathError extends Error {
  name = 'DuplicatePathError'
  constructor(public message: string, public pathType: string, public paths: string[][]) {
    super(message)
  }
}

const removeCwd = (path: string) => path.replace(process.cwd(), '')

const renderErrorMessage = (path: string, type: string) =>
  `- ${path.split(`${type}/`)[0]}${type}/${log.variable(path.split(`${type}/`)[1])}`

export function renderDuplicatePathError(err: DuplicatePathError) {
  log.error(err.message)

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
  log.error(err.message)

  process.stdout.write('\n')

  err.routes.forEach((route) => {
    console.log(`- ${removeCwd(route)}`)
  })

  process.stdout.write('\n')

  log.error(err.secondary)
}
