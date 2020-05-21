import * as repl from 'repl'
import * as chokidar from 'chokidar'
import {Console} from '../../src/commands/console'
import {getBlitzModulePaths} from '../../src/utils/load-blitz'
import {REPLServer} from 'repl'
import {FSWatcher} from 'chokidar'

const mockRepl = ({
  defineCommand: jest.fn(),
  on: jest.fn(),
  context: {},
} as any) as REPLServer
const mockWatcher = ({
  on: jest.fn(),
} as any) as FSWatcher

jest.mock('repl')
jest.mock('chokidar')
jest.mock(`${process.cwd()}/package.json`, () => ({
  dependencies: {
    ramda: '1.0.0',
  },
}))
jest.mock('@blitzjs/generator/src/utils/load-dependencies')
jest.mock('../../src/utils/load-blitz')

describe('Console command', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('runs REPL', async () => {
    jest.spyOn(Console.prototype, 'log')
    jest.spyOn(repl, 'start').mockReturnValue(mockRepl)
    jest.spyOn(chokidar, 'watch').mockReturnValue(mockWatcher)
    jest.spyOn(mockRepl, 'on').mockReturnValue(mockRepl)

    await Console.prototype.run()

    expect(repl.start).toBeCalledWith(Console.replOptions)
    expect(mockRepl.defineCommand).toBeCalledWith('reload', Console.commands.reload)

    // expect(chokidar.watch).toBeCalledWith('package.json')
    expect(chokidar.watch).toBeCalledWith(getBlitzModulePaths())
  })
})
