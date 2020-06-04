import fs from 'fs'
import {resolve} from 'path'
import {agnosticSource} from '.'
import {testStreamItems} from '../../test-utils'

const cwd = resolve(__dirname, 'fixtures')

function logItem(fileOrString: {path: string} | string) {
  if (typeof fileOrString === 'string') {
    return fileOrString
  }
  return fileOrString.path
}

describe('agnosticSource', () => {
  afterEach(() => {
    if (fs.existsSync(resolve(cwd, 'three'))) {
      fs.unlinkSync(resolve(cwd, 'three'))
    }
  })

  test('when watching = false', (done) => {
    const expected = [resolve(cwd, 'one'), resolve(cwd, 'two')]
    const {stream} = agnosticSource({ignore: [], include: ['**/*'], cwd, watch: false})
    const log: any[] = []
    stream.on('data', (data) => {
      if (data === 'ready') {
        expect(log).toEqual(expected)
        return done()
      }
      log.push(data.path)
    })
  })

  test('when watching = true', async () => {
    const expected = [resolve(cwd, 'one'), resolve(cwd, 'two'), 'ready', resolve(cwd, 'three')]
    const {stream} = agnosticSource({ignore: [], include: ['**/*'], cwd, watch: true})

    setTimeout(() => {
      // Wait
      const filename = resolve(cwd, 'three')
      fs.writeFile(filename, Buffer.from('three'), () => {})
    }, 800)

    await testStreamItems(stream, expected, logItem)
  })
})
