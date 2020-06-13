import {createIdleHandler} from '.'
import {pipeline, through} from '../../streams'
import {testStreamItems} from '../../test-utils'
import {IDLE, READY} from '../../events'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('idlehander', () => {
  it('should fire the idle event', async () => {
    // Setup an input stream
    const input = through.obj()

    const bus = through.obj()

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
