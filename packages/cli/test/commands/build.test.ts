const build = jest.fn(() => {})
jest.mock('../../src/scripts/build', () => ({build}))

import BuildCmd from '../../src/commands/build'
import {resolve} from 'path'

describe('Build command', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const options = {
    buildFolder: '.blitz/caches/build',
    devFolder: '.blitz/caches/dev',
    rootFolder: resolve(__dirname, '../../'),
  }

  it('runs the build script', async () => {
    await BuildCmd.run([])
    expect(build).toBeCalledWith(options)
  })
})
