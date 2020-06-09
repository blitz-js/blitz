import * as repl from 'repl'
import * as chokidar from 'chokidar'
import {REPLServer} from 'repl'
import {FSWatcher} from 'chokidar'

import * as loadBlitzFunctions from '../src/utils/load-blitz'
import {runRepl} from '../src/repl'

jest.spyOn(global.console, 'log').mockImplementation()

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

const pathToModulesMock = ['/module', 'module2']
const loadBlitzMock = {blitz: 'app'}

describe('Console command', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(repl, 'start').mockReturnValue(mockRepl)
    jest.spyOn(chokidar, 'watch').mockReturnValue(mockWatcher)
    jest.spyOn(mockRepl, 'on').mockReturnValue(mockRepl)
    jest.spyOn(loadBlitzFunctions, 'getBlitzModulePaths').mockResolvedValue(pathToModulesMock)
    jest.spyOn(loadBlitzFunctions, 'loadBlitz').mockResolvedValue(loadBlitzMock)
  })

  it('starts REPL', async () => {
    const options = {prompt: '> running'}
    await runRepl(options)

    expect(repl.start).toBeCalledWith(options)
  })

  it('defines reload command', async () => {
    await runRepl({})
    expect(mockRepl.defineCommand).toBeCalledWith(
      'reload',
      expect.objectContaining({
        help: 'Reload all modules',
      }),
    )
  })

  it('watches for modules changes', async () => {
    await runRepl({})
    expect(loadBlitzFunctions.getBlitzModulePaths).toBeCalled()
    expect(chokidar.watch).toBeCalledWith(pathToModulesMock, {ignoreInitial: true})
  })

  it('calls loadBlitz', async () => {
    await runRepl({})
    expect(loadBlitzFunctions.loadBlitz).toBeCalled()
  })
})
