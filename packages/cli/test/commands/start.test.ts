const dev = jest.fn(() => {})

jest.mock('../../src/start/dev', () => ({dev}))

import StartCmd from '../../src/commands/start'

describe('Start command', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('runs the dev script', async () => {
    await StartCmd.prototype.run()
    expect(dev).toBeCalled()
  })
})
