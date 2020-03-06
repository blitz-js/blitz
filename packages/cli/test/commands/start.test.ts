import childProcess from 'child_process'
import StartCmd from '../../src/commands/start'

jest.mock('child_process')

describe('Start command', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('runs next dev', async () => {
    await StartCmd.prototype.run()

    expect(childProcess.spawn).toBeCalledWith('next', ['dev'], {stdio: 'inherit'})
  })
})
