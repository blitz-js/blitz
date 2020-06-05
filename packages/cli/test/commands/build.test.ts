const build = jest.fn(() => {})
jest.mock('@blitzjs/server', () => ({build, resolveBinAsync: jest.fn()}))

let onSpy: jest.Mock
const spawn = jest.fn(() => {
  onSpy = jest.fn(function on(_: string, callback: (_: number) => {}) {
    callback(0)
  })
  return {on: onSpy}
})

jest.doMock('cross-spawn', () => ({spawn}))

import {Build} from '../../src/commands/build'
import {resolve} from 'path'

describe('Build command', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const options = {
    rootFolder: resolve(__dirname, '../../'),
    port: 3000,
    hostname: 'localhost',
  }

  it('runs the build script', async () => {
    await Build.run([])
    expect(build).toBeCalledWith(options, Promise.resolve())
  })
})
