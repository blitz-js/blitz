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
import {dev} from '../src/dev'
import {build} from '../src/build'
import {resolve} from 'path'
import {FSWatcher} from 'chokidar'
import {remove, pathExists, writeFile} from 'fs-extra'
import directoryTree from 'directory-tree'

describe('Dev command', () => {
  let watcher: FSWatcher

  const rootFolder = resolve(__dirname, './fixtures/rules')
  const buildFolder = resolve(rootFolder, '.blitz')
  const devFolder = resolve(rootFolder, '.blitz-rules')

  beforeEach(async () => {
    jest.clearAllMocks()
    watcher = await dev({rootFolder, buildFolder, devFolder, writeManifestFile: false})
  })

  afterEach(async () => {
    if (await pathExists(devFolder)) {
      await remove(devFolder)
    }
    watcher?.close()
  })

  it('should copy the correct files to the dev folder', async () => {
    const tree = directoryTree(devFolder)
    expect(tree).toEqual({
      path: `${devFolder}`,
      name: '.blitz-rules',
      children: [
        {
          extension: '.js',
          name: 'blitz.config.js',
          path: `${devFolder}/blitz.config.js`,
          size: 20,
          type: 'file',
        },
        {
          extension: '.js',
          name: 'next.config.js',
          path: `${devFolder}/next.config.js`,
          size: 130,
          type: 'file',
        },
        {
          path: `${devFolder}/pages`,
          name: 'pages',
          children: [
            {
              path: `${devFolder}/pages/bar.tsx`,
              name: 'bar.tsx',
              size: 60,
              extension: '.tsx',
              type: 'file',
            },
            {
              path: `${devFolder}/pages/foo.tsx`,
              name: 'foo.tsx',
              size: 60,
              extension: '.tsx',
              type: 'file',
            },
          ],
          size: 120,
          type: 'directory',
        },
      ],
      size: 270,
      type: 'directory',
    })
  })
})

describe('Build command ZEIT', () => {
  const rootFolder = resolve(__dirname, './fixtures/rules')
  const buildFolder = resolve(rootFolder, '.blitz')
  const devFolder = resolve(rootFolder, '.blitz-rules')

  beforeEach(async () => {
    process.env.NOW_BUILDER = '1'
    jest.clearAllMocks()

    const defaultZeitConfig = "module.exports = { target: 'experimental-serverless-trace' };"
    await writeFile(resolve(rootFolder, 'next.config.js'), Buffer.from(defaultZeitConfig))

    await build({rootFolder, buildFolder, devFolder, writeManifestFile: false})
  })

  afterEach(async () => {
    delete process.env.NOW_BUILDER
    if (await pathExists(buildFolder)) {
      await remove(buildFolder)
    }

    await remove(resolve(rootFolder, 'next.config.js'))
  })

  it('should copy the correct files to the build folder', async () => {
    const tree = directoryTree(buildFolder)
    expect(tree).toEqual({
      path: `${buildFolder}`,
      name: '.blitz',
      children: [
        {
          extension: '.js',
          name: 'blitz.config.js',
          path: `${buildFolder}/blitz.config.js`,
          size: 20,
          type: 'file',
        },
        {
          extension: '.js',
          name: 'next-zeit.config.js',
          path: `${buildFolder}/next-zeit.config.js`,
          size: 61,
          type: 'file',
        },
        {
          extension: '.js',
          name: 'next.config.js',
          path: `${buildFolder}/next.config.js`,
          size: 61,
          type: 'file',
        },
        {
          path: `${buildFolder}/pages`,
          name: 'pages',
          children: [
            {
              path: `${buildFolder}/pages/bar.tsx`,
              name: 'bar.tsx',
              size: 60,
              extension: '.tsx',
              type: 'file',
            },
            {
              path: `${buildFolder}/pages/foo.tsx`,
              name: 'foo.tsx',
              size: 60,
              extension: '.tsx',
              type: 'file',
            },
          ],
          size: 120,
          type: 'directory',
        },
      ],
      size: 262,
      type: 'directory',
    })
  })
})
