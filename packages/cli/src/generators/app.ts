import {execSync} from 'child_process'
import * as path from 'path'
import Generator = require('yeoman-generator')
const debug = require('debug')('blitz:generate-app')

import {Flags} from '../commands/new'

let hasYarn = false
try {
  execSync('yarn -v', {stdio: 'ignore'})
  hasYarn = true
} catch {}

class AppGenerator extends Generator {
  path!: string

  constructor(args: string | string[], opts: Flags) {
    super(args, opts)

    this.path = args[0] ? path.resolve(args[0]) : this.destinationRoot()
  }

  async prompting() {
    const appName = path.basename(this.path)
    const answers = await this.prompt([
      {
        type: 'input',
        name: 'path',
        message: 'How do you want your project to be called?',
        default: appName,
      },
      {
        type: 'confirm',
        name: 'typescript',
        message: 'Do you want to use TypeScript?',
        default: this.options.ts,
        when: !this.options.ts,
      },
      {
        type: 'confirm',
        name: 'yarn',
        message: 'Do you want to use Yarn instead of NPM?',
        default: this.options.yarn || hasYarn,
        when: !this.options.yarn,
      },
    ])

    debug('Answers: ', answers)

    this.options = {
      ...this.options,
      ...answers,
    }

    debug('Options: ', answers)

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
    this.fs.copyTpl(this.templatePath('pages/index.js.ejs'), this.destinationPath('pages/index.js'), {
      name: this.path,
    })

    this.fs.writeJSON(this.destinationPath('package.json'), this._packageJson(this.path))

    this.fs.copy(this.templatePath('gitignore'), this.destinationPath('.gitignore'))
  }

  install() {
    const dependencies = ['next', 'react', 'react-dom']
    const install = (depts: string[], opts: object) =>
      this.options.yarn ? this.yarnInstall(depts, opts) : this.npmInstall(depts, opts)
    const dev = this.options.yarn ? {dev: true} : {'save-dev': true}
    const save = this.options.yarn ? {} : {save: true}

    install(dependencies, save)
  }

  _packageJson(name: string) {
    return {
      name,
      version: '0.0.1',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
      },
    }
  }
}

export default AppGenerator
