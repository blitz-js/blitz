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

// Mock where the next bin is
jest.doMock('../src/resolve-bin-async', () => ({
  resolveBinAsync: jest.fn().mockReturnValue(Promise.resolve('')),
}))

// Import with mocks applied
import {build} from '../src/build'
import {directoryTree} from './utils/tree-utils'
import mockfs from 'mock-fs'
import {resolve} from 'path'

describe('Build command', () => {
  const rootFolder = resolve('build')
  const buildFolder = resolve(rootFolder, '.blitz-build')
  const devFolder = resolve(rootFolder, '.blitz')

  beforeEach(async () => {
    mockfs({
      build: {
        '.now': '',
        one: '',
        two: '',
      },
    })
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

  afterEach(() => {
    mockfs.restore()
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
