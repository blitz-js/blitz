const dev = jest.fn(() => {})
const prod = jest.fn(() => {})
jest.mock('../../src/scripts/dev', () => ({dev}))
jest.mock('../../src/scripts/prod', () => ({prod}))

import StartCmd from '../../src/commands/start'
import {resolve} from 'path'

describe('Start command', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const options = {
    buildFolder: '.blitz/caches/build',
    devFolder: '.blitz/caches/dev',
    rootFolder: resolve(__dirname, '../../'),
  }

  it('runs the dev script', async () => {
    await StartCmd.run([])
    expect(dev).toBeCalledWith(options)
  })

  it('runs the prod script when passed the production flag', async () => {
    await StartCmd.run(['--production'])
    expect(prod).toBeCalledWith(options)
  })
})
