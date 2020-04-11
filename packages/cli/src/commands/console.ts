import {Command} from '@oclif/command'
import * as REPL from 'repl'
import {REPLCommand, REPLServer} from 'repl'
import {watch} from 'chokidar'

import {loadDependencies} from '../utils/load-dependencies'
import {BLITZ_MODULE_PATHS, loadBlitz} from '../utils/load-blitz'

export default class Console extends Command {
  static description = 'Run project REPL'
  static aliases = ['c']
  static message = `Welcome to Blitz.js v0.0.1
Type ".help" for more information.`

  static replOptions = {
    prompt: '⚡️>',
    useColors: true,
  }

  static commands = {
    reload: {
      help: 'Reload all modules',
      action(this: REPLServer) {
        this.clearBufferedCommand()
        console.log('Reloading all modules...')
        Console.loadModules(this)
        this.displayPrompt()
      },
    },
  }

  async run() {
    this.log(Console.message)

    const repl = Console.initializeRepl()

    const watchers = [
      watch('package.json').on('change', () => Console.loadDependencies(repl)),
      watch(BLITZ_MODULE_PATHS).on('all', () => Console.loadBlitz(repl)),
    ]

    repl
      .on('reset', () => Console.loadModules(repl))
      .on('exit', () => watchers.forEach(watcher => watcher.close()))
  }

  private static initializeRepl() {
    const repl = REPL.start(Console.replOptions)
    Console.defineCommands(repl, Console.commands)
    Console.loadModules(repl)
    return repl
  }

  private static loadModules(repl: REPLServer) {
    // Console.loadDependencies(repl)
    Console.loadBlitz(repl)
  }

  private static loadDependencies(repl: REPLServer) {
    Object.assign(repl.context, loadDependencies(process.cwd()))
  }

  private static loadBlitz(repl: REPLServer) {
    Object.assign(repl.context, loadBlitz())
  }

  private static defineCommands(repl: REPLServer, commands: Record<string, REPLCommand>) {
    Object.entries(commands).forEach(([keyword, cmd]) => repl.defineCommand(keyword, cmd))
  }
}
