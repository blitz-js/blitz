import {runRepl} from '@blitzjs/repl'
import {Command} from '@oclif/command'
import path from 'path'
import fs from 'fs'
import pkgDir from 'pkg-dir'
import {log} from '@blitzjs/display'
import chalk from 'chalk'

import {setupTsnode} from '../utils/setup-ts-node'
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

    runRepl(Console.replOptions)
  }
}
