// import {execSync} from 'child_process'
// import * as path from 'path'
// import * as fs from 'fs'
import Generator, {GeneratorOptions} from '../generator'
// const debug = require('debug')('blitz:generate-app')

// import {Flags} from '../commands/new'

// let hasYarn = false
// try {
//   execSync('yarn -v', {stdio: 'ignore'})
//   hasYarn = true
// } catch {}

export interface AppGeneratorOptions extends GeneratorOptions {
  appName: string
}

class AppGenerator extends Generator<AppGeneratorOptions> {
  packageJson() {
    return {
      name: this.options.appName,
      version: '0.0.1',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
      },
    }
  }

  async write() {
    this.fs.copyTpl(this.sourcePath('README.md.ejs'), this.destinationPath('README.md'), {
      name: 'Hello',
    })
    this.fs.copyTpl(this.sourcePath('pages/index.js.ejs'), this.destinationPath('pages/index.js'), {
      name: 'Hello',
    })

    this.fs.writeJSON(this.destinationPath('package.json'), this.packageJson())

    this.fs.copy(this.sourcePath('gitignore'), this.destinationPath('.gitignore'))
  }
}

export default AppGenerator
