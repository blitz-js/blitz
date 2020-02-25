import {Command, flags} from '@oclif/command'
const yeoman = require('yeoman-environment')
const debug = require('debug')('blitz:new')

export interface Flags {
  typescript: boolean
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
    typescript: flags.boolean({char: 't', description: 'generate a TypeScript project', default: false}),
    yarn: flags.boolean({description: 'Use Yarn instead of NPM', default: false}),
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
