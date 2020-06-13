const dev = jest.fn(() => {})
const prod = jest.fn(() => {})

jest.mock('@blitzjs/server', () => ({dev, prod, resolveBinAsync: jest.fn()}))

let onSpy: jest.Mock
const spawn = jest.fn(() => {
  onSpy = jest.fn(function on(_: string, callback: (_: number) => {}) {
    callback(0)
  })
  return {on: onSpy}
})

jest.doMock('cross-spawn', () => ({spawn}))

import {Start} from '../../src/commands/start'
import {resolve} from 'path'

describe('Start command', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const options = {
    rootFolder: resolve(__dirname, '../../'),
    port: 3000,
    hostname: 'localhost',
  }

  it('runs the dev script', async () => {
    await Start.run([])
    expect(dev).toBeCalledWith(options, Promise.resolve())
  })

  it('runs the prod script when passed the production flag', async () => {
    await Start.run(['--production'])
    expect(prod).toBeCalledWith(options, Promise.resolve())
  })
})
