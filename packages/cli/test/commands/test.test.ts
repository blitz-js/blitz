import childProcess from 'child_process'
import hasYarn from 'has-yarn'
import TestCmd from '../../src/commands/test'

jest.mock('child_process')
jest.mock('has-yarn')

describe('Test command', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('runs yarn test script', async () => {
    jest.spyOn(hasYarn, 'default').mockReturnValue(true)

    await TestCmd.prototype.run()

    expect(childProcess.spawn).toBeCalledWith('yarn', ['test'], {stdio: 'inherit'})
  })

  it('runs npm test script', async () => {
    jest.spyOn(hasYarn, 'default').mockReturnValue(false)

    await TestCmd.prototype.run()

    expect(childProcess.spawn).toBeCalledWith('npm', ['test'], {stdio: 'inherit'})
  })
})
