import {Command, flags} from '@oclif/command'

export default class Start extends Command {
  static description = 'Start development server'

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with no value (-f, --force)
    force: flags.boolean({char: 'f'}),
    // port number
    port: flags.string({char: 'p'}),
  }

  static args = [{name: 'file'}]

  async run() {
    const {args, flags} = this.parse(Start)

    // TODO: Run any assets builds and trigger watcher

    if (args.file && flags.force) {
      // TODO: force starting server on port
    }
    // TODO: start developement server on port
  }
}
