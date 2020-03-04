import * as repl from 'repl'
import ConsoleCmd from '../../src/commands/console'

jest.mock('repl')

describe('Console command', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('runs REPL', async () => {
    jest.spyOn(ConsoleCmd.prototype, 'log')

    await ConsoleCmd.prototype.run()

    expect(repl.start).toBeCalledWith(ConsoleCmd.replOptions)
    expect(ConsoleCmd.prototype.log).toHaveBeenCalledWith(`Welcome to Blitz.js v0.0.1
Type ".help" for more information.`)
  })
})
