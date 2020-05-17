import {Console} from '../../src/commands/console'

import * as console from '@blitzjs/console'
import * as db from '../../src/commands/db'

jest.spyOn(global.console, 'log').mockImplementation()

jest.mock(
  '@blitzjs/server',
  jest.fn(() => {
    return {
      log: {
        branded: jest.fn(),
        spinner: () => {
          return {
            start: jest.fn().mockImplementation(() => ({succeed: jest.fn()})),
          }
        },
      },
    }
  }),
)

jest.mock(`${process.cwd()}/package.json`, () => ({
  dependencies: {
    ramda: '1.0.0',
  },
}))

jest.mock(
  '@blitzjs/console',
  jest.fn(() => {
    return {
      runConsole: jest.fn(),
    }
  }),
)

jest.mock(
  '../../src/commands/db',
  jest.fn(() => {
    return {
      runPrismaGeneration: jest.fn(),
    }
  }),
)

describe('Console command', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('runs PrismaGeneration', async () => {
    await Console.prototype.run()
    expect(db.runPrismaGeneration).toHaveBeenCalled()
  })

  it('runs PrismaGeneration with silent allowed', async () => {
    await Console.prototype.run()
    expect(db.runPrismaGeneration).toHaveBeenCalledWith({silent: true})
  })

  it('runs console', async () => {
    await Console.prototype.run()
    expect(console.runConsole).toHaveBeenCalled()
  })

  it('runs console with replOptions', async () => {
    await Console.prototype.run()
    expect(console.runConsole).toHaveBeenCalledWith(Console.replOptions)
  })
})
