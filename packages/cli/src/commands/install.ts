import {Command} from '../command'
import * as path from 'path'
import {Installer} from '@blitzjs/installer'

// eslint-disable-next-line import/no-default-export
export default class Install extends Command {
  static description = 'Install a third-party package into your Blitz app'
  static aliases = ['i']
  static strict = false

  static args = [
    {
      name: 'installer',
      required: true,
      description: 'Name of a Blitz installer from @blitzjs/installers, or a file path to a local installer',
    },
    {
      name: 'installer-flags',
      description:
        'A list of flags to pass to the installer. Blitz will only parse these in the form key=value',
    },
  ]

  async run() {
    const {args} = this.parse(Install)
    const isNavtiveInstaller = /^([\w]*)$/.test(args.installer)
    if (isNavtiveInstaller) {
    } else {
      const installerPath = path.resolve(args.installer)
      const installer = require(installerPath).default as Installer<any>
      const installerArgs = this.argv.reduce(
        (acc, arg) => ({
          ...acc,
          [arg.split('=')[0]]: JSON.parse(arg.split('=')[1] || String(true)), // if no value is provided, assume it's a boolean flag
        }),
        {},
      )
      await installer.run(installerArgs)
    }
  }
}
