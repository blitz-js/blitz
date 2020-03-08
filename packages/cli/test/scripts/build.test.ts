// Setup mocks

const fsExtraMock = {
  copy: jest.fn(),
  unlink: jest.fn(),
  ensureDir: jest.fn(),
  move: jest.fn(),
}

const nextUtilsMock = {
  nextBuild: jest.fn().mockReturnValue(Promise.resolve()),
}

const reporterMock = {
  reporter: {copy: jest.fn(), remove: jest.fn()},
}

// jest.doMock('child_process', () => childProcessMock)
jest.doMock('fs-extra', () => fsExtraMock)
jest.doMock('../../src/scripts/reporter', () => reporterMock)
jest.doMock('../../src/scripts/next-utils', () => nextUtilsMock)

// Import with mocks applied
import {build} from '../../src/scripts/build'
import {resolve} from 'path'

describe('Build command', () => {
  const rootFolder = resolve(__dirname, './dev-fixtures')
  const buildFolder = resolve(rootFolder, '.blitz-build')
  const devFolder = resolve(rootFolder, '.blitz')

  beforeEach(async () => {
    jest.clearAllMocks()
    await build({rootFolder, buildFolder, devFolder})
  })

  it('copies each file to the .blitz folder', () => {
    const copyOpts = {dereference: true}
    expect(fsExtraMock.copy.mock.calls).toEqual([
      // NOTE: .now should be ignored
      [resolve(rootFolder, 'one'), resolve(buildFolder, 'one'), copyOpts],
      [resolve(rootFolder, 'two'), resolve(buildFolder, 'two'), copyOpts],
    ])
  })

  it('calls nextBuild', () => {
    expect(nextUtilsMock.nextBuild).toHaveBeenCalledWith(
      resolve(rootFolder, './node_modules/.bin/next'),
      buildFolder,
    )
  })

  it('moves the next folder from the build folder to the root folder', () => {
    expect(fsExtraMock.move).toHaveBeenCalledWith(resolve(buildFolder, '.next'), resolve(rootFolder, '.next'))
  })
})
