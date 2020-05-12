import {Install, InstallerType} from '../../src/commands/install'
import * as path from 'path'
import tempInstaller from '../__fixtures__/installer'

jest.mock('../__fixtures__/installer')
jest.mock('@blitzjs/installer')

describe('`install` command', () => {
  afterAll(() => {
    jest.resetAllMocks()
  })
  it('runs local installer', async (done) => {
    await Install.run([path.resolve(__dirname, '../__fixtures__/installer')])
    expect(tempInstaller.run).toHaveBeenCalledWith({})
    done()
  })

  it('properly parses remote installer args', () => {
    const normalizePath = Install.prototype.normalizeInstallerPath
    expect(normalizePath('test-installer')).toEqual({
      path: 'https://github.com/blitz-js/blitz',
      subdirectory: 'installers/test-installer',
      type: InstallerType.Remote,
    })
    expect(normalizePath('user/test-installer')).toEqual({
      path: 'https://github.com/user/test-installer',
      type: InstallerType.Remote,
    })
    expect(normalizePath('https://github.com/user/test-installer')).toEqual({
      path: 'https://github.com/user/test-installer',
      type: InstallerType.Remote,
    })
  })
})
