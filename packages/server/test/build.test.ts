/* eslint-disable import/first */

const nextUtilsMock = {
  nextBuild: jest.fn().mockReturnValue(Promise.resolve()),
}
// Quieten reporter
jest.doMock('../src/reporter', () => ({
  reporter: {copy: jest.fn(), remove: jest.fn()},
}))

// Assume next works
jest.doMock('../src/next-utils', () => nextUtilsMock)

// Import with mocks applied
import {build} from '../src/build'
import {resolve} from 'path'
import {remove, pathExists} from 'fs-extra'
import {directoryTree} from './utils/tree-utils'

describe('Build command', () => {
  const rootFolder = resolve(__dirname, './fixtures/build')
  const buildFolder = resolve(rootFolder, '.blitz-build')
  const devFolder = resolve(rootFolder, '.blitz')

  beforeEach(async () => {
    jest.clearAllMocks()
    await build({
      rootFolder,
      buildFolder,
      devFolder,
      writeManifestFile: false,
      port: 3000,
      hostname: 'localhost',
    })
  })

  afterEach(async () => {
    const nextFolder = resolve(rootFolder, '.next')

    if (await pathExists(nextFolder)) {
      await remove(nextFolder)
    }

    if (await pathExists(buildFolder)) {
      await remove(buildFolder)
    }
  })

  it('should copy the correct files to the build folder', async () => {
    const tree = directoryTree(rootFolder)
    expect(tree).toEqual({
      children: [
        {
          children: [{name: 'blitz.config.js'}, {name: 'next.config.js'}, {name: 'one'}, {name: 'two'}],
          name: '.blitz-build',
        },
        {name: '.now'},
        {name: 'one'},
        {name: 'two'},
      ],
      name: 'build',
    })
  })
})
