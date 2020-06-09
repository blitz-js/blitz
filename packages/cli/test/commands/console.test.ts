import {Console} from '../../src/commands/console'

import * as repl from '@blitzjs/repl'
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
  '@blitzjs/repl',
  jest.fn(() => {
    return {
      runRepl: jest.fn(),
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

  it('runs repl', async () => {
    await Console.prototype.run()
    expect(repl.runRepl).toHaveBeenCalled()
  })

  it('runs repl with replOptions', async () => {
    await Console.prototype.run()
    expect(repl.runRepl).toHaveBeenCalledWith(Console.replOptions)
  })
})
