import {Command} from '@oclif/command'
import {REPL_MODE_SLOPPY, REPLServer, start} from 'repl'
import {loadDependencies} from '../utils/load-dependencies'

function initializeContext(context: REPLServer['context']) {
  Object.assign(context, ...loadDependencies(process.cwd()))
}

export default class Console extends Command {
  static description = 'Run project REPL'
  static aliases = ['c']

  static replOptions = {
    prompt: '⚡️>',
    useColors: true,
    replMode: REPL_MODE_SLOPPY
  }

  async run () {
    this.log(`Welcome to Blitz.js v0.0.1
Type ".help" for more information.`)
    let repl = start(Console.replOptions)
    repl.defineCommand('reload', {
      help: 'Reload all modules',
      action () {
        this.clearBufferedCommand();
        console.log('Reloading all modules...')
        initializeContext(this.context)
        this.displayPrompt()
      },
    })
    repl.on('reset', initializeContext)
    initializeContext(repl.context)
  }

  private
}
