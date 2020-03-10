import { Command } from '@oclif/command'
import { start } from 'repl'

export default class Console extends Command {
  static description = 'Run project REPL'
  static aliases = ['c']

  static replOptions = {
    prompt: '⚡️>',
    useColors: true
  }

  async run () {
    this.log(`Welcome to Blitz.js v0.0.1
Type ".help" for more information.`)

    start(Console.replOptions)
  }
}
