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
const originalLog = console.log

// Import with mocks applied
import {dev} from '../src/dev'
import {join, resolve} from 'path'
import {remove, pathExists} from 'fs-extra'
import {Manifest} from '../src/synchronizer/pipeline/rules/manifest/index'
import {directoryTree} from './utils/tree-utils'
import * as pkgDir from 'pkg-dir'

describe.only('Dev command', () => {
  let rootFolder: string
  let buildFolder: string
  let devFolder: string
  let consoleOutput: string[] = []
  const mockedLog = (output: string) => consoleOutput.push(output)

  beforeEach(() => {
    console.log = mockedLog
    jest.clearAllMocks()
  })

  afterEach(async () => {
    console.log = originalLog

    if (await pathExists(devFolder)) {
      await remove(devFolder)
    }
  })

  describe('throw in nextStartDev', () => {
    beforeEach(() => {
      nextUtilsMock.nextStartDev.mockRejectedValue('pow')
    })

    afterEach(() => {
      nextUtilsMock.nextStartDev.mockReturnValue(Promise.resolve())
    })

    it('should blow up', (done) => {
      const mockSynchronizer = () => Promise.resolve({manifest: Manifest.create()})
      ;(async () => {
        try {
          await dev({
            synchronizer: mockSynchronizer,
            rootFolder: '',
            writeManifestFile: false,
            watch: false,
            port: 3000,
            hostname: 'localhost',
          })
        } catch (err) {
          expect(err).toBe('pow')
          done()
        }
      })()
    })
  })

  describe('when with next.config', () => {
    beforeEach(async () => {
      rootFolder = resolve(__dirname, './fixtures/bad-config')
      buildFolder = resolve(rootFolder, '.blitz')
      devFolder = resolve(rootFolder, '.blitz')
    })

    it('should fail when passed a next.config.js', async () => {
      try {
        await dev({
          rootFolder,
          buildFolder,
          devFolder,
          writeManifestFile: false,
          watch: false,
          port: 3000,
          hostname: 'localhost',
        })
      } catch (_e) {}
      consoleOutput.includes(
        'Blitz does not support next.config.js. Please rename your next.config.js to blitz.config.js',
      )
    })
  })

  describe('when run normally', () => {
    beforeEach(async () => {
      rootFolder = resolve(__dirname, './fixtures/dev')
      buildFolder = resolve(rootFolder, '.blitz')
      devFolder = resolve(rootFolder, '.blitz-dev')
      await dev({
        rootFolder,
        buildFolder,
        devFolder,
        writeManifestFile: false,
        watch: false,
        port: 3000,
        hostname: 'localhost',
      })
    })

    it('should copy the correct files to the dev folder', async () => {
      const tree = directoryTree(rootFolder)
      expect(tree).toEqual({
        children: [
          {
            children: [{name: 'blitz.config.js'}, {name: 'next.config.js'}, {name: 'one'}, {name: 'two'}],
            name: '.blitz-dev',
          },
          {name: '.now'},
          {name: 'one'},
          {name: 'two'},
        ],
        name: 'dev',
      })
    })

    it.only('calls spawn with the patched next cli bin', () => {
      const nextPatched = join(String(pkgDir.sync(__dirname)), 'bin', 'next-patched')
      const blitzDev = join(rootFolder, '.blitz-dev')
      expect(nextUtilsMock.nextStartDev.mock.calls[0].length).toBe(5)
      expect(nextUtilsMock.nextStartDev.mock.calls[0][0]).toBe(nextPatched)
      expect(nextUtilsMock.nextStartDev.mock.calls[0][1]).toBe(blitzDev)
      expect(nextUtilsMock.nextStartDev.mock.calls[0][4]).toHaveProperty('port')
      expect(nextUtilsMock.nextStartDev.mock.calls[0][4]).toHaveProperty('hostname')
    })
  })
})
