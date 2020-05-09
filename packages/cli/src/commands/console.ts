import {Command} from '@oclif/command'
import * as REPL from 'repl'
import path from 'path'
import fs from 'fs'
import {REPLCommand, REPLServer} from 'repl'
import {watch} from 'chokidar'
import pkgDir from 'pkg-dir'
import {log} from '@blitzjs/server'
import chalk from 'chalk'

// import {loadDependencies} from '../utils/load-dependencies'
import {setupTsnode, getBlitzModulePaths, loadBlitz} from '../utils/load-blitz'
import {runPrismaGeneration} from './db'

const projectRoot = pkgDir.sync() || process.cwd()
const isTypescript = fs.existsSync(path.join(projectRoot, 'tsconfig.json'))

export class Console extends Command {
  static description = 'Run the Blitz console REPL'
  static aliases = ['c']

  static replOptions = {
    prompt: '⚡️ > ',
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
    log.branded('You have entered the Blitz console')
    console.log(chalk.yellow('Tips: - Exit by typing .exit or pressing Ctrl-D'))
    console.log(chalk.yellow('      - Use your db like this: db.project.findMany().then(console.log)'))
    console.log(chalk.yellow('      - Use your queries/mutations like this: getProjects().then(console.log)'))
    console.log(
      chalk.yellow('      - Top level `await` support coming: https://github.com/blitz-js/blitz/issues/230'),
    )

    const spinner = log.spinner('Loading your code').start()
    if (isTypescript) {
      setupTsnode()
    }

    await runPrismaGeneration({silent: true})
    spinner.succeed()

    const repl = Console.initializeRepl()

    const watchers = [
      // watch('package.json').on('change', () => Console.loadDependencies(repl)),
      watch(getBlitzModulePaths()).on('all', () => Console.loadBlitz(repl)),
    ]

    repl
      .on('reset', () => Console.loadModules(repl))
      .on('exit', () => watchers.forEach((watcher) => watcher.close()))
  }

  private static initializeRepl() {
    const repl = REPL.start(Console.replOptions)
    Console.defineCommands(repl, Console.commands)
    Console.loadModules(repl)
    repl.setupHistory(path.join(projectRoot, '.blitz-console-history'), () => {})
    return repl
  }

  private static loadModules(repl: REPLServer) {
    // Console.loadDependencies(repl)
    Console.loadBlitz(repl)
  }

  // private static loadDependencies(repl: REPLServer) {
  //   Object.assign(repl.context, loadDependencies(process.cwd()))
  // }

  private static loadBlitz(repl: REPLServer) {
    Object.assign(repl.context, loadBlitz())
  }

  private static defineCommands(repl: REPLServer, commands: Record<string, REPLCommand>) {
    Object.entries(commands).forEach(([keyword, cmd]) => repl.defineCommand(keyword, cmd))
  }
}
