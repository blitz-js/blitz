/* eslint-disable import/first */

const nextUtilsMock = {
  nextStart: jest.fn().mockReturnValue(Promise.resolve()),
  nextBuild: jest.fn().mockReturnValue(Promise.resolve()),
}

// Assume next works
jest.doMock('../src/next-utils', () => nextUtilsMock)

// Assume build works
const buildMock = {build: jest.fn().mockReturnValue(Promise.resolve())}
jest.doMock('../src/build', () => buildMock)

// Mock where the next bin is
jest.doMock('../src/resolve-bin-async', () => ({
  resolveBinAsync: jest.fn().mockReturnValue(Promise.resolve('')),
}))

// Import with mocks applied
import {prod} from '../src/prod'
import mockfs from 'mock-fs'
import {resolve} from 'path'
import {ensureDir, writeFile} from 'fs-extra'
import {getInputArtefactsHash} from '../src/build-hash'

describe('Prod command', () => {
  const rootFolder = resolve('build')
  const buildFolder = resolve(rootFolder, '.blitz-build')
  const devFolder = resolve(rootFolder, '.blitz')
  const prodArgs = {
    rootFolder,
    buildFolder,
    devFolder,
    writeManifestFile: false,
    port: 3000,
    hostname: 'localhost',
  }

  beforeEach(async () => {
    mockfs({
      build: {
        '.now': '',
        one: '',
        two: '',
      },
    })
    jest.clearAllMocks()
  })

  afterEach(() => {
    mockfs.restore()
  })

  describe('When not already built', () => {
    it('should trigger build step', async () => {
      await prod(prodArgs)
      expect(buildMock.build.mock.calls).toEqual([[prodArgs]])
    })
  })

  describe('When already built', () => {
    it('should not trigger build step', async () => {
      ensureDir(buildFolder)
      await writeFile(`${buildFolder}/last-build`, await getInputArtefactsHash())
      await prod(prodArgs)
      expect(buildMock.build.mock.calls).toEqual([])
    })
  })
})
