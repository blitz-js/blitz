import {Command, flags} from '@oclif/command'
import yeoman = require('yeoman-environment')
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
    const env = yeoman.createEnv()

    env.register(require.resolve('../generators/app'), 'generate:app')
    env.run(['generate:app', args.path], flags as Flags, (err: Error | null) => {
      if (err) this.error(err) // Maybe tell a bit more...
      this.log('App created!') // This needs some sparkles ✨
    })
  }
}
