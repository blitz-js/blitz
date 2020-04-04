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
import {remove, pathExists, FSWatcher} from 'fs-extra'
import directoryTree from 'directory-tree'

describe('Build command', () => {
  const rootFolder = resolve(__dirname, './fixtures/build')
  const buildFolder = resolve(rootFolder, '.blitz-build')
  const devFolder = resolve(rootFolder, '.blitz')

  beforeEach(async () => {
    jest.clearAllMocks()
    await build({rootFolder, buildFolder, devFolder, writeManifestFile: false})
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
          children: [
            {
              extension: '',
              name: 'one',
              path: `${rootFolder}/.blitz-build/one`,
              size: 0,
              type: 'file',
            },
            {
              extension: '',
              name: 'two',
              path: `${rootFolder}/.blitz-build/two`,
              size: 0,
              type: 'file',
            },
          ],
          name: '.blitz-build',
          path: `${rootFolder}/.blitz-build`,
          size: 0,
          type: 'directory',
        },
        {
          extension: '',
          name: '.now',
          path: `${rootFolder}/.now`,
          size: 18,
          type: 'file',
        },
        {
          extension: '',
          name: 'one',
          path: `${rootFolder}/one`,
          size: 0,
          type: 'file',
        },
        {
          extension: '',
          name: 'two',
          path: `${rootFolder}/two`,
          size: 0,
          type: 'file',
        },
      ],
      name: 'build',
      path: `${rootFolder}`,
      size: 18,
      type: 'directory',
    })
  })

  it('calls nextBuild', () => {
    expect(nextUtilsMock.nextBuild).toHaveBeenCalledWith(
      resolve(rootFolder, './node_modules/.bin/next'),
      buildFolder,
    )
  })
})
