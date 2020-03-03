import childProcess from 'child_process'
import TestCmd from '../../src/commands/test'

jest.mock('child_process')

describe('Test command', () => {
  it('runs yarn test script', async () => {
    await TestCmd.prototype.run()

    expect(childProcess.spawn).toBeCalledWith('yarn', ['test'], {stdio: 'inherit'})
  })
})
