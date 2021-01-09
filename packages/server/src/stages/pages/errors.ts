import {log} from "@blitzjs/display"
import {ERROR_THROWN} from "@blitzjs/file-pipeline"
import {Writable} from "stream"

export type Event<T> = {type: string; payload: T}

type Error = DuplicatePathError

export function handleErrors(bus: Writable) {
  bus.on("data", (event: Event<Error>) => {
    if (event.type !== ERROR_THROWN) return
    const err = event.payload as Error
    if (err instanceof DuplicatePathError) {
      renderDuplicatePathError(err)
      return
    }
  })
}

export class DuplicatePathError extends Error {
  name = "DuplicatePathError"
  constructor(public message: string, public pathType: string, public paths: string[][]) {
    super(message)
  }
}

const removeCwd = (path: string) => path.replace(process.cwd(), "")

const renderErrorMessage = (path: string, type: string) =>
  `- ${path.split(`${type}/`)[0]}${type}/${log.variable(path.split(`${type}/`)[1])}`

export function renderDuplicatePathError(err: DuplicatePathError) {
  log.error(err.message)

  err.paths.forEach((page) => {
    page.forEach((path) => console.log(renderErrorMessage(removeCwd(path), err.pathType)))
  })
}
