// Setup mocks
const childProcessMock = {
  spawn: jest.fn().mockReturnValue({on: () => {}}),
}

const fsExtraMock = {
  copy: jest.fn(),
  unlink: jest.fn(),
  ensureDir: jest.fn(),
}

const reporterMock = {
  reporter: {copy: jest.fn(), remove: jest.fn()},
}

jest.doMock('child_process', () => childProcessMock)
jest.doMock('fs-extra', () => fsExtraMock)
jest.doMock('../../src/start/reporter', () => reporterMock)

// Import with mocks applied
import {dev} from '../../src/start/dev'
import {resolve} from 'path'
import {FSWatcher} from 'chokidar'

describe('Start command', () => {
  let watcher: FSWatcher

  const rootFolder = resolve(__dirname, './dev-fixtures')
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

  it('calls spawn with the next cli bin', () => {
    expect(childProcessMock.spawn).toHaveBeenCalledWith(
      resolve(rootFolder, './node_modules/.bin/next'),
      ['dev'],
      {
        cwd: devFolder,
        stdio: 'inherit',
      },
    )
  })
})
