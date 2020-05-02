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
const originalLog = console.log

// Mock where the next bin is
jest.doMock('../src/resolve-bin-async', () => ({
  resolveBinAsync: jest.fn().mockImplementation((...a) => join(...a)), // just join the paths
}))

// Import with mocks applied
import {dev} from '../src/dev'
import {join, resolve} from 'path'
import {Manifest} from '../src/synchronizer/pipeline/rules/manifest/index'
import {directoryTree} from './utils/tree-utils'
import mockfs from 'mock-fs'

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

  describe.skip('when with next.config', () => {
    beforeEach(async () => {
      rootFolder = resolve('bad')
      buildFolder = resolve(rootFolder, '.blitz')
      devFolder = resolve(rootFolder, '.blitz')
      mockfs({
        'bad/next.config.js': 'yo',
      })
    })
    afterEach(() => {
      mockfs.restore()
    })

    it('should fail when passed a next.config.js', async () => {
      expect.assertions(2)
      await expect(
        dev({
          rootFolder,
          buildFolder,
          devFolder,
          writeManifestFile: false,
          watch: false,
          port: 3000,
          hostname: 'localhost',
        }),
      ).rejects.toThrowError('Blitz does not support')

      expect(
        consoleOutput.includes(
          'Blitz does not support next.config.js. Please rename your next.config.js to blitz.config.js',
        ),
      ).toBeTruthy()
    })
  })

  describe('when run normally', () => {
    beforeEach(async () => {
      rootFolder = resolve('dev')
      buildFolder = resolve(rootFolder, '.blitz')
      devFolder = resolve(rootFolder, '.blitz-dev')
    })
    afterEach(() => {
      mockfs.restore()
    })

    it('should copy the correct files to the dev folder', async () => {
      mockfs({
        'dev/.now': '',
        'dev/one': '',
        'dev/two': '',
      })
      await dev({
        rootFolder,
        buildFolder,
        devFolder,
        writeManifestFile: false,
        watch: false,
        port: 3000,
        hostname: 'localhost',
      })
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

    it('calls spawn with the patched next cli bin', async () => {
      mockfs(
        {
          'dev/@blitzjs/server/next-patched': '',
        },
        {createCwd: false, createTmp: false},
      )
      await dev({
        rootFolder,
        buildFolder,
        devFolder,
        writeManifestFile: false,
        watch: false,
        port: 3000,
        hostname: 'localhost',
      })
      const nextPatched = resolve(rootFolder, '@blitzjs/server', 'next-patched')
      const blitzDev = join(rootFolder, '.blitz-dev')
      expect(nextUtilsMock.nextStartDev.mock.calls[0].length).toBe(5)
      expect(nextUtilsMock.nextStartDev.mock.calls[0][0]).toBe(nextPatched)
      expect(nextUtilsMock.nextStartDev.mock.calls[0][1]).toBe(blitzDev)
      expect(nextUtilsMock.nextStartDev.mock.calls[0][4]).toHaveProperty('port')
      expect(nextUtilsMock.nextStartDev.mock.calls[0][4]).toHaveProperty('hostname')
    })
  })
})
