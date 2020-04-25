// Mostly concerned with solving the Dirty Sync problem

import {streams} from '@blitzjs/utils'

import File from 'vinyl'

/**
 * Returns streams that help handling work optimisation in the file transform stream.
 */
// TODO:  This needs quite a bit of work before we can manage a dirty start
//        Currently this does not do much aside from guard against repeated work
export default () => {
  const todo: Array<string> = []
  const done: Array<string> = []

  const stats = {todo, done}

  const reportComplete = streams.through({objectMode: true}, (file: File, _, next) => {
    done.push(file.hash)
    next(null, file)
  })

  const triage = streams.through({objectMode: true}, function (file: File, _, next) {
    // Dont send files that have already been done or have already been added
    if (done.includes(file.hash) || todo.includes(file.hash)) {
      process.env.DEBUG && console.log('Rejecting because this job has been done before: ' + file.path)
      return next()
    }

    todo.push(file.hash)

    this.push(file)

    next()
  })

  return {triage, reportComplete, stats}
}
