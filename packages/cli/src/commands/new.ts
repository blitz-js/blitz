import * as path from 'path'
import {Command, flags} from '@oclif/command'
import AppGenerator from '../generators/app'
const debug = require('debug')('blitz:new')

export interface Flags {
  ts: boolean
  yarn: boolean
}

export default class New extends Command {
  static description = 'Create a new Blitz project'

  static args = [
    {
      name: 'path',
      required: false,
      description: 'path to the new project, defaults to the current directory',
    },
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    ts: flags.boolean({
      char: 't',
      description: 'generate a TypeScript project',
      default: true,
      allowNo: true,
    }),
    yarn: flags.boolean({description: 'use Yarn as the package manager', default: true}),
  }

  async run() {
    const {args, flags} = this.parse(New)
    debug('args: ', args)
    debug('flags: ', flags)

    const destinationRoot = args[0] ? path.resolve(args[0]) : process.cwd()
    const appName = path.basename(destinationRoot)

    const generator = new AppGenerator({
      sourceRoot: path.join(__dirname, '../../templates/app'),
      destinationRoot,
      appName,
    })

    try {
      await generator.run()
      this.log('App Created!')
    } catch (err) {
      this.error(err)
    }
  }
}
