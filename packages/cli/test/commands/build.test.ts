const build = jest.fn(() => {})
jest.mock('@blitzjs/server', () => ({build}))

import BuildCmd from '../../src/commands/build'
import {resolve} from 'path'
import {ServerConfig} from '@blitzjs/server/src/config'

describe('Build command', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const options: ServerConfig = {
    rootFolder: resolve(__dirname, '../../'),
    serverless: true,
  }

  it('runs the build script', async () => {
    await BuildCmd.run([])
    expect(build).toBeCalledWith(options)
  })
})
