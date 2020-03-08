import {spawn} from 'child_process'
import {Command, flags} from '@oclif/command'

export default class Start extends Command {
  static description = 'Start development server'
  static aliases = ['s']

  static flags = {
    help: flags.help({char: 'h'}),
    production: flags.boolean({
      char: 'p',
      description: 'runs a production build',
      default: false,
      allowNo: false,
    })
  }

  async run() {
    const {flags} = this.parse(Start)
    if (flags.production) {
      const cp = spawn('next', ['build'], {stdio: 'inherit'})
      cp.on('exit', (code:number) => {
        if (code == 0)
          spawn('next', ['start'], {stdio: 'inherit'})
      })
    }
    else {
      spawn('next', ['dev'], {stdio: 'inherit'})
    }
    
  }
}

