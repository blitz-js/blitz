import childProcess from 'child_process'
import ConsoleCmd from '../../src/commands/console'

jest.mock('child_process')

describe('Console command', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('runs node', async () => {
    await ConsoleCmd.prototype.run()

    expect(childProcess.spawn).toBeCalledWith('node', {stdio: 'inherit'})
  })
})
