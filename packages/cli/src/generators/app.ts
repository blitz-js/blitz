import * as path from 'path'
import * as Generator from 'yeoman-generator'
import createDebug from 'debug'

import {Options} from '../commands/new'

const debug = createDebug('blitz:generate-app')

class AppGenerator extends Generator {
  path!: string
  typescript!: boolean

  constructor(public args: string | string[], public opts: Options) {
    super(args, opts)
  }

  async prompting() {
    const answers = await this.prompt([
      {
        type: 'input',
        name: 'path',
        message: 'How do you want your project to be called?',
        default: this.opts.path ?? this.determineAppname(),
        when: !this.opts.path,
      },
      {
        type: 'confirm',
        name: 'typescript',
        message: 'Do you want to use TypeScript?',
        default: this.opts.typescript,
        when: !this.opts?.typescript,
      },
    ])

    debug(answers)

    this.path = answers.path || this.opts.path
    this.typescript = answers.typescript || this.opts.typescript

    if (this.path) {
      this.destinationRoot(path.resolve(this.path))
      process.chdir(this.destinationRoot())
    }
  }

  writing() {
    this.sourceRoot(path.join(__dirname, '../../templates/app'))

    this.fs.copyTpl(this.templatePath('README.md.ejs'), this.destinationPath('README.md'), {
      name: this.path,
    })
  }
}

export default AppGenerator
