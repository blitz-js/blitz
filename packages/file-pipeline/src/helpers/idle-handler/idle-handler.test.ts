import {createIdleHandler} from '.'
import {pipeline, through} from '../../streams'
import {testStreamItems} from '../../test-utils'
import {IDLE, READY} from '../../events'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('idlehander', () => {
  it('should fire the idle event', async () => {
    // TODO: work out a better way to tests streams

    // Setup an input stream
    const input = through({objectMode: true}, (ev, __, next) => {
      next(null, ev)
    })

    const bus = through({objectMode: true}, (ev, __, next) => {
      next(null, ev)
    })

    // setup the test pipeline
    const idleHandler = createIdleHandler(bus, 100)
    pipeline(input, idleHandler.stream)

    const arr = [1, 2, 3, 4]
    for (const item of arr) {
      input.write(item)
    }
    await sleep(150)
    for (const item of arr) {
      input.write(item)
    }
    input.write('ready')
    await sleep(150)
    for (const item of arr) {
      input.write(item)
    }

    await testStreamItems(bus, [{type: IDLE}, {type: READY}, {type: IDLE}], (a) => a)
  })
})
