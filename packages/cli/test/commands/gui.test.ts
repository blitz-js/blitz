import spawn from 'cross-spawn'
import {log} from '@blitzjs/display'

import {GUI} from '../../src/commands/gui'

jest.spyOn(global.console, 'log').mockImplementation()

// Mocks the log output
jest.mock(
  '@blitzjs/display',
  jest.fn(() => {
    return {
      log: {
        branded: jest.fn(),
        warning: jest.fn(),
      },
    }
  }),
)

// Mocks spawn
jest.mock('cross-spawn', () => {
  return {
    sync: jest.fn().mockImplementation(() => {
      return {status: 0}
    }),
  }
})

describe('GUI Command', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls @blitzjs/gui', async () => {
    await GUI.run()

    expect(spawn.sync).toHaveBeenCalledWith('@blitzjs/gui', ['start'], {stdio: 'ignore'})
  })

  describe('when@blitzjs/gui fails', () => {
    it('logs warn', async () => {
      // @ts-ignore (TS complains about reassign)
      spawn.sync = jest.fn().mockImplementation(() => {
        return {status: 1}
      })
      await GUI.run()

      expect(log.warning).toHaveBeenCalledWith('Failed to start Blitz GUI.')
    })
  })
})
