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
jest.doMock('../../src/scripts/reporter', () => reporterMock)

// Import with mocks applied
import {startDev} from '../../src/scripts/startDev'
import {resolve} from 'path'
import {FSWatcher} from 'chokidar'

describe('Start command', () => {
  let watcher: FSWatcher
  const root = resolve(__dirname, './startDev')

  beforeEach(async () => {
    jest.clearAllMocks()
    watcher = await startDev({root, persistent: true})
  })

  afterEach(async () => {
    watcher.close()
  })

  it('copies each file to the .blitz folder', () => {
    const copyOpts = {dereference: true}
    expect(fsExtraMock.copy.mock.calls).toEqual([
      // .now should be ignored
      [resolve(root, 'one'), resolve(root, '.blitz/one'), copyOpts],
      [resolve(root, 'two'), resolve(root, '.blitz/two'), copyOpts],
    ])
  })

  it('deletes files', async () => {
    watcher.emit('unlink', resolve(root, '.now'), {})
    expect(fsExtraMock.unlink.mock.calls).toEqual([[resolve(root, '.blitz/.now')]])
  })

  it('calls spawn with the next cli bin', () => {
    expect(childProcessMock.spawn).toHaveBeenCalledWith('../node_modules/.bin/next', ['dev'], {
      cwd: resolve(__dirname, './startDev/.blitz'),
      stdio: 'inherit',
    })
  })
})
