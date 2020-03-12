// Setup mocks
const fsExtraMock = {
  copy: jest.fn(),
  unlink: jest.fn(),
  ensureDir: jest.fn(),
}

const reporterMock = {
  reporter: {copy: jest.fn(), remove: jest.fn()},
}

const nextUtilsMock = {
  nextStartDev: jest.fn().mockReturnValue(Promise.resolve()),
}

jest.doMock('fs-extra', () => fsExtraMock)
jest.doMock('../src/next-utils', () => nextUtilsMock)
jest.doMock('../src/reporter', () => reporterMock)

// Import with mocks applied
import {dev} from '../src/dev'
import {resolve} from 'path'
import {FSWatcher} from 'chokidar'

describe.skip('Start command', () => {
  let watcher: FSWatcher

  const rootFolder = resolve(__dirname, './fixtures/dev')
  const buildFolder = resolve(rootFolder, '.blitz')
  const devFolder = resolve(rootFolder, '.blitz')

  beforeEach(async () => {
    jest.clearAllMocks()
    watcher = await dev({rootFolder, buildFolder, devFolder})
  })

  afterEach(async () => {
    watcher.close()
  })

  it('copies each file to the .blitz folder', () => {
    const copyOpts = {dereference: true}
    expect(fsExtraMock.copy.mock.calls).toEqual([
      // NOTE: .now should be ignored
      [resolve(rootFolder, 'one'), resolve(devFolder, 'one'), copyOpts],
      [resolve(rootFolder, 'two'), resolve(devFolder, 'two'), copyOpts],
    ])
  })

  it('deletes files', async () => {
    watcher.emit('unlink', resolve(rootFolder, '.now'), {})
    expect(fsExtraMock.unlink.mock.calls).toEqual([[resolve(rootFolder, '.blitz/.now')]])
  })

  it('calls spawn with the patched next cli bin', () => {
    expect(nextUtilsMock.nextStartDev).toHaveBeenCalledWith(
      resolve(rootFolder, './node_modules/.bin/next-patched'),
      devFolder,
    )
  })
})
