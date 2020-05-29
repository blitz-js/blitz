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
import {build} from '../src/build'
import {resolve} from 'path'

import {directoryTree} from './utils/tree-utils'

import mockfs from 'mock-fs'

describe('Build command Vercel', () => {
  const rootFolder = resolve('')
  const buildFolder = resolve(rootFolder, '.blitz-build')
  const devFolder = resolve(rootFolder, '.blitz-dev')

  beforeEach(async () => {
    process.env.NOW_BUILDER = '1'
    mockfs({
      'app/posts/pages/foo.tsx': '',
      'pages/bar.tsx': '',
      'next.config.js': 'module.exports = {target: "experimental-serverless-trace"}',
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
    delete process.env.NOW_BUILDER
    mockfs.restore()
  })

  it('should copy the correct files to the build folder', async () => {
    const tree = directoryTree(buildFolder)
    expect(tree).toEqual({
      name: '.blitz-build',
      children: [
        {name: 'blitz.config.js'},
        {name: 'last-build'},
        {name: 'next-vercel.config.js'},
        {name: 'next.config.js'},
        {
          name: 'pages',
          children: [{name: 'bar.tsx'}, {name: 'foo.tsx'}],
        },
      ],
    })
  })
})
