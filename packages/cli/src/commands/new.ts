import * as path from 'path'
import {flags} from '@oclif/command'
import Command from '../command'
import AppGenerator from '../generators/app'
import chalk from 'chalk'
import hasbin from 'hasbin'
const debug = require('debug')('blitz:new')

import PromptAbortedError from '../errors/prompt-aborted'

export interface Flags {
  ts: boolean
  yarn: boolean
}

export default class New extends Command {
  static description = 'Create a new Blitz project'

  static args = [
    {
      name: 'name',
      required: true,
      description: 'name of your new project',
    },
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    // ts: flags.boolean({
    //   char: 't',
    //   description: 'generate a TypeScript project',
    //   default: true,
    //   allowNo: true,
    // }),
    yarn: flags.boolean({
      description: 'use Yarn as the package manager',
      default: hasbin.sync('yarn'),
      allowNo: true,
    }),
    'dry-run': flags.boolean({description: 'show what files will be created without writing them to disk'}),
  }

  async run() {
    const {args, flags} = this.parse(New)
    debug('args: ', args)
    debug('flags: ', flags)

    const destinationRoot = path.resolve(args.name)
    const appName = path.basename(destinationRoot)

    const generator = new AppGenerator({
      sourceRoot: path.join(__dirname, '../../templates/app'),
      destinationRoot,
      appName,
      dryRun: flags['dry-run'],
      yarn: flags.yarn,
    })

    const themeColor = '6700AB'

    try {
      this.log('\n' + chalk.hex(themeColor).bold('Hang tight while we set up your new Blitz app!') + '\n')
      await generator.run()
      this.log('\n' + chalk.hex(themeColor).bold('Your new Blitz app is ready! Next steps:') + '\n')
      this.log(chalk.yellow(`   1. cd ${args.name}`))
      this.log(chalk.yellow(`   2. blitz start\n`))
    } catch (err) {
      if (err instanceof PromptAbortedError) this.exit(0)

      this.error(err)
    }
  }
}
