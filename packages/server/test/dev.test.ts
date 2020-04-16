/* eslint-disable import/first */

const nextUtilsMock = {
  nextStartDev: jest.fn().mockReturnValue(Promise.resolve()),
}
// Quieten reporter
jest.doMock('../src/reporter', () => ({
  reporter: {copy: jest.fn(), remove: jest.fn()},
}))

// Assume next works
jest.doMock('../src/next-utils', () => nextUtilsMock)

// Import with mocks applied
import {dev} from '../src/dev'
import {resolve} from 'path'
import {FSWatcher} from 'chokidar'
import {remove, pathExists} from 'fs-extra'
import directoryTree from 'directory-tree'

describe('Dev command', () => {
  let watcher: FSWatcher
  let rootFolder: string
  let buildFolder: string
  let devFolder: string

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(async () => {
    if (await pathExists(devFolder)) {
      await remove(devFolder)
    }
    watcher?.close()
  })

  describe('when with next.config', () => {
    beforeEach(async () => {
      rootFolder = resolve(__dirname, './fixtures/bad-config')
      buildFolder = resolve(rootFolder, '.blitz')
      devFolder = resolve(rootFolder, '.blitz')
    })

    it('should fail when passed a next.config.js', (done) => {
      dev({rootFolder, buildFolder, devFolder, writeManifestFile: false})
        .then((w) => {
          watcher = w
        })
        .catch((err) => {
          expect(err.name).toBe('ConfigurationError')
          done()
        })
    })
  })

  describe('when run normally', () => {
    beforeEach(async () => {
      rootFolder = resolve(__dirname, './fixtures/dev')
      buildFolder = resolve(rootFolder, '.blitz')
      devFolder = resolve(rootFolder, '.blitz-dev')
      watcher = await dev({rootFolder, buildFolder, devFolder, writeManifestFile: false})
    })

    it('should copy the correct files to the dev folder', async () => {
      const tree = directoryTree(rootFolder)
      expect(tree).toEqual({
        children: [
          {
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
                extension: '',
                name: 'one',
                path: `${devFolder}/one`,
                size: 0,
                type: 'file',
              },
              {
                extension: '',
                name: 'two',
                path: `${devFolder}/two`,
                size: 0,
                type: 'file',
              },
            ],
            name: '.blitz-dev',
            path: `${devFolder}`,
            size: 150,
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
        name: 'dev',
        path: `${rootFolder}`,
        size: 168,
        type: 'directory',
      })
    })

    it('calls spawn with the patched next cli bin', () => {
      expect(nextUtilsMock.nextStartDev.mock.calls[0][0]).toBe(`${rootFolder}/node_modules/.bin/next-patched`)
      expect(nextUtilsMock.nextStartDev.mock.calls[0][1]).toBe(`${rootFolder}/.blitz-dev`)
    })
  })
})
