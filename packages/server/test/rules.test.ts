/* eslint-disable import/first */

const nextUtilsMock = {
  nextStartDev: jest.fn().mockReturnValue(Promise.resolve()),
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
import {dev} from '../src/dev'
import {resolve} from 'path'

import {directoryTree} from './utils/tree-utils'

import mockfs from 'mock-fs'

describe('Dev command', () => {
  const rootFolder = '/'
  const buildFolder = resolve(rootFolder, '.blitz-build')
  const devFolder = resolve(rootFolder, '.blitz-rules')

  beforeEach(async () => {
    mockfs(
      {
        '/app/posts/pages/foo.tsx': '',
        '/pages/bar.tsx': '',
      },
      {createCwd: false, createTmp: false},
    )
    jest.clearAllMocks()
    await dev({rootFolder, buildFolder, devFolder, writeManifestFile: false, watch: false})
  })

  afterEach(() => {
    mockfs.restore()
  })

  it('should copy the correct files to the dev folder', async () => {
    const tree = directoryTree(devFolder)
    expect(tree).toEqual({
      name: '.blitz-rules',
      children: [
        {name: 'blitz.config.js'},
        {name: 'next.config.js'},
        {
          name: 'pages',
          children: [{name: 'bar.tsx'}, {name: 'foo.tsx'}],
        },
      ],
    })
  })
})
