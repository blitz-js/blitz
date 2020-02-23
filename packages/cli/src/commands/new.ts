import {Command, flags} from '@oclif/command'

export default class New extends Command {
  static description = 'Create new Blitz project'

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({char: 'n', description: 'Directory name'}),
    // flag with no value (-f, --force)
    force: flags.boolean({char: 'f'}),
  }

  static args = [{name: 'file'}]

  async run() {
    const {args, flags} = this.parse(New)

    const name = flags.name || 'hello-world'
    // TODO: Handoff to generator
    if (args.file && flags.force) {
      // TODO: Logic to force creation on existing directory
    }
  }
}
