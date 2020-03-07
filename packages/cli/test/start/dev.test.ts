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

  const root = resolve(__dirname, './dev-fixtures')
  const blitzRoot = resolve(root, '.blitz')

  beforeEach(async () => {
    jest.clearAllMocks()
    watcher = await dev({root})
  })

  afterEach(async () => {
    watcher.close()
  })

  it('copies each file to the .blitz folder', () => {
    const copyOpts = {dereference: true}
    expect(fsExtraMock.copy.mock.calls).toEqual([
      // NOTE: .now should be ignored
      [resolve(root, 'one'), resolve(blitzRoot, 'one'), copyOpts],
      [resolve(root, 'two'), resolve(blitzRoot, 'two'), copyOpts],
    ])
  })

  it('deletes files', async () => {
    watcher.emit('unlink', resolve(root, '.now'), {})
    expect(fsExtraMock.unlink.mock.calls).toEqual([[resolve(root, '.blitz/.now')]])
  })

  it('calls spawn with the next cli bin', () => {
    expect(childProcessMock.spawn).toHaveBeenCalledWith('../node_modules/.bin/next', ['dev'], {
      cwd: blitzRoot,
      stdio: 'inherit',
    })
  })
})
