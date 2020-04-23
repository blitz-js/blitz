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
import {directoryTree} from './utils/tree-utils'
import * as pkgDir from 'pkg-dir'

describe('Dev command', () => {
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

  describe('when with next.config', () => {
    beforeEach(async () => {
      rootFolder = resolve(__dirname, './fixtures/bad-config')
      buildFolder = resolve(rootFolder, '.blitz')
      devFolder = resolve(rootFolder, '.blitz')
    })

    it('should fail when passed a next.config.js', async () => {
      try {
        await dev({rootFolder, buildFolder, devFolder, writeManifestFile: false, watch: false})
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
      await dev({rootFolder, buildFolder, devFolder, writeManifestFile: false, watch: false})
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

    it('calls spawn with the patched next cli bin', () => {
      const nextPatched = join(String(pkgDir.sync(__dirname)), 'bin', 'next-patched')
      const blitzDev = join(rootFolder, '.blitz-dev')
      expect(nextUtilsMock.nextStartDev.mock.calls[0][0]).toBe(nextPatched)
      expect(nextUtilsMock.nextStartDev.mock.calls[0][1]).toBe(blitzDev)
    })
  })
})
