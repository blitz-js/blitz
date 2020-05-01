import createIdleHandler from './idle-handler'

import {to, pipeline, through} from '../../streams'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('idlehander', () => {
  it('should fire the idle event', async (done) => {
    // TODO: work out a better way to tests streams

    // Setup an input stream
    const input = through({objectMode: true}, (ev, __, next) => {
      next(null, ev)
    })

    // Setup a logger
    const log: string[] = []
    const logger = to.obj(function (evt, _, next) {
      // If end
      if (evt === 'end') {
        expect(log).toEqual([{type: 'READY'}, {type: 'IDLE'}, {type: 'IDLE'}])
        done()
        next()
        return
      }

      // log the event
      log.push(evt)
      next()
    })

    // setup the test pipeline
    const idleHandler = createIdleHandler(logger, 100)
    pipeline(input, idleHandler.stream)

    const arr = [1, 2, 3, 4]
    for (const item of arr) {
      input.write(item)
    }
    await sleep(150)
    for (const item of arr) {
      input.write(item)
    }

    await sleep(150)
    for (const item of arr) {
      input.write(item)
    }

    input.end()
    logger.write('end')
  })
})
