const childProcessMock = {
  spawn: jest.fn().mockReturnValue({on: () => {}}),
}

const fsExtraMock = {
  copy: jest.fn(),
  unlist: jest.fn(),
  ensureDir: jest.fn(),
}

const reporterMock = {
  reporter: {copy: jest.fn(), remove: jest.fn()},
}

jest.doMock('child_process', () => childProcessMock)
jest.doMock('fs-extra', () => fsExtraMock)
jest.doMock('../../src/scripts/reporter', () => reporterMock)

import {startDev} from '../../src/scripts/startDev'
import {resolve} from 'path'

describe('Start command', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    const root = resolve(__dirname, './startDev')
    await startDev({root, persistent: true})
  })

  it('copies each file to the .blitz folder', () => {
    const root = resolve(__dirname, './startDev')
    const copyOpts = {dereference: true}
    expect(fsExtraMock.copy.mock.calls).toEqual([
      // .now should be ignored
      [resolve(root, 'one'), resolve(root, '.blitz/one'), copyOpts],
      [resolve(root, 'two'), resolve(root, '.blitz/two'), copyOpts],
    ])
  })

  it('calls spawn with the next cli bin', () => {
    expect(childProcessMock.spawn).toHaveBeenCalledWith('../node_modules/.bin/next', ['dev'], {
      cwd: resolve(__dirname, './startDev/.blitz'),
      stdio: 'inherit',
    })
  })
})
