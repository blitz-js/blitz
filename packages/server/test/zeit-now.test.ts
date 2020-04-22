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

// Import with mocks applied
import {build} from '../src/build'
import {resolve} from 'path'

import {remove, pathExists} from 'fs-extra'
import {directoryTree} from './utils/tree-utils'

describe('Build command ZEIT', () => {
  const rootFolder = resolve(__dirname, './fixtures/zeit-now')
  const buildFolder = resolve(rootFolder, '.blitz-build')
  const devFolder = resolve(rootFolder, '.blitz-dev')

  beforeEach(async () => {
    process.env.NOW_BUILDER = '1'
    jest.clearAllMocks()
    await build({rootFolder, buildFolder, devFolder, writeManifestFile: false})
  })

  afterEach(async () => {
    delete process.env.NOW_BUILDER
    if (await pathExists(buildFolder)) {
      await remove(buildFolder)
    }
  })

  it('should copy the correct files to the build folder', async () => {
    const tree = directoryTree(buildFolder)
    expect(tree).toEqual({
      name: '.blitz-build',
      children: [
        {name: 'blitz.config.js'},
        {name: 'next-zeit.config.js'},
        {name: 'next.config.js'},
        {
          name: 'pages',
          children: [{name: 'bar.tsx'}, {name: 'foo.tsx'}],
        },
      ],
    })
  })
})
