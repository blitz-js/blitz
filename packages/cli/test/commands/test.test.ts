import childProcess from 'child_process'
import hasYarn from 'has-yarn'
import TestCmd from '../../src/commands/test'

jest.mock('child_process')
jest.mock('has-yarn')

const testParams = [['test'], {stdio: 'inherit'}]
const testWatchParams = [['test:watch'], {stdio: 'inherit'}]

describe('Test command', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('runs yarn test script', async () => {
    jest.spyOn(hasYarn, 'default').mockReturnValue(true)

    await TestCmd.run([])

    expect(childProcess.spawn).toBeCalledWith('yarn', ...testParams)
  })

  it('runs npm test script', async () => {
    jest.spyOn(hasYarn, 'default').mockReturnValue(false)

    await TestCmd.run([])

    expect(childProcess.spawn).toBeCalledWith('npm', ...testParams)
  })

  it('runs yarn test:watch script', async () => {
    jest.spyOn(hasYarn, 'default').mockReturnValue(true)

    await TestCmd.run(['watch'])

    expect(childProcess.spawn).toBeCalledWith('yarn', ...testWatchParams)
  })

  it('runs yarn test:watch script with alias', async () => {
    jest.spyOn(hasYarn, 'default').mockReturnValue(true)

    await TestCmd.run(['w'])

    expect(childProcess.spawn).toBeCalledWith('yarn', ...testWatchParams)
  })

  it('runs yarn test and ignores invalid argument', async () => {
    jest.spyOn(hasYarn, 'default').mockReturnValue(true)

    await TestCmd.run(['invalid'])

    expect(childProcess.spawn).toBeCalledWith('yarn', ...testParams)
  })
})
