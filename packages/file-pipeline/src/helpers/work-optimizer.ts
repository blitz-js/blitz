// Mostly concerned with solving the Dirty Sync problem

import {through} from '../streams'
import {log} from '@blitzjs/display'
import File from 'vinyl'

/**
 * Returns streams that help handling work optimisation in the file transform stream.
 */
// TODO:  This needs quite a bit of work before we can manage a dirty start
//        Currently this does not do much aside from guard against repeated work
export function createWorkOptimizer() {
  const todo: Array<string> = []
  const done: Array<string> = []

  const stats = {todo, done}

  const reportComplete = through({objectMode: true}, (file: File, _, next) => {
    if (file.hash) {
      done.push(file.hash)
    }
    next(null, file)
  })

  const triage = through({objectMode: true}, function (file: File, _, next) {
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

    this.push(file)

    next()
  })

  return {triage, reportComplete, stats}
}
