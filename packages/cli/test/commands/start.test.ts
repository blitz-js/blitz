const startDev = jest.fn(() => {})

jest.mock('../../src/scripts/startDev', () => ({startDev}))

import StartCmd from '../../src/commands/start'

describe('Start command', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('runs the startDev script', async () => {
    await StartCmd.prototype.run()
    expect(startDev).toBeCalled()
  })
})
