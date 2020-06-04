// Mostly concerned with solving the Dirty Sync problem
import {log} from '@blitzjs/display'
import {transform} from '../transform'

/**
 * Returns streams that help handling work optimisation in the file transform stream.
 */
// TODO:  This needs quite a bit of work before we can manage a dirty start
//        Currently this does not do much aside from guard against repeated work
export function createWorkOptimizer() {
  const todo: Array<string> = []
  const done: Array<string> = []

  const stats = {todo, done}

  const reportComplete = transform.file((file) => {
    if (file.hash) {
      done.push(file.hash)
    }
    return file
  })

  const triage = transform.file((file, {push, next}) => {
    if (!file.hash) {
      log.debug('File does not have hash! ' + file.path)
      return next()
    }
    // Dont send files that have already been done or have already been added
    if (done.includes(file.hash) || todo.includes(file.hash)) {
      log.debug('Rejecting because this job has been done before: ' + file.path)
      return next()
    }

    todo.push(file.hash)

    push(file)

    next()
  })

  return {triage, reportComplete, stats}
}
