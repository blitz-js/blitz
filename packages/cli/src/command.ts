import {Command as OclifCommand} from '@oclif/command'
import Enquirer = require('enquirer')
import chalk = require('chalk')

export type LogOptions = {
  pad?: boolean
  indent?: boolean
}

abstract class Command extends OclifCommand {
  protected enquirer = new Enquirer()
  protected themeColor = '6700AB'
  protected indent = false

  logTheme(str: string, options?: LogOptions) {
    this.log(chalk.bgWhite.hex(this.themeColor).bold(str), options)
  }

  log(formattedStr: string, options: LogOptions = {}) {
    const verticalPad = options.pad ? '\n' : ''
    const indent = this.indent || options.indent ? '\t' : ''
    super.log(`${verticalPad}${indent}${formattedStr}${verticalPad}`)
  }

  setLogIndent() {
    this.indent = true
  }

  stopLogIndent() {
    this.indent = false
  }
}

export default Command
