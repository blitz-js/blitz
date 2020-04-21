import {Command} from '@oclif/command'
import {build} from '@blitzjs/server'
import {ServerConfig} from '@blitzjs/server/src/config'

export default class Build extends Command {
  static description = 'Create a production build'
  static aliases = ['b']

  async run() {
    const config: ServerConfig = {
      rootFolder: process.cwd(),
      serverless: true,
    }

    await build(config)
  }
}
