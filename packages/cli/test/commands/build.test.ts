const build = jest.fn(() => {})
jest.mock('@blitzjs/server', () => ({build}))

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
    expect(build).toBeCalledWith(options)
  })
})
