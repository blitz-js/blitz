const copy = jest.fn()
const remove = jest.fn()
const spawn = jest.fn().mockReturnValue({on: () => {}})

jest.doMock('child_process', () => ({spawn}))
jest.mock('fs-extra')
jest.mock('../../src/scripts/reporter', () => ({reporter: {copy, remove}}))

import {startDev} from '../../src/scripts/startDev'
import {resolve} from 'path'

describe('Start command', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    const root = resolve(__dirname, './startDev')
    await startDev({root, persistent: true})
  })

  it('copies each file to the .blitz folder', async () => {
    const root = resolve(__dirname, './startDev')
    expect(copy.mock.calls).toEqual([
      // .now should be ignored
      [root, resolve(root, 'one'), resolve(root, '.blitz/one')],
      [root, resolve(root, 'two'), resolve(root, '.blitz/two')],
    ])
  })

  it('calls spawn with the next cli bin', () => {
    expect(spawn).toBeCalledWith('../node_modules/.bin/next', ['dev'], {
      cwd: resolve(__dirname, './startDev/.blitz'),
      stdio: 'inherit',
    })
  })
})
