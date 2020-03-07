import {Transform, TransformCallback} from 'stream'
import * as path from 'path'
import File from 'vinyl'
import {diffLines, Change} from 'diff'
import * as fs from 'fs-extra'
import chalk = require('chalk')
import enquirer = require('enquirer')

import PromptAbortedError from '../errors/prompt-aborted'

interface PromptAnswer {
  action: 'overwrite' | 'skip' | 'show'
}

type PromptActions = 'overwrite' | 'skip' | 'identical'

export default class ConflictChecker extends Transform {
  private _destroyed = false

  constructor() {
    super({
      objectMode: true,
    })
  }

  _transform(file: File, _encoding: string, cb: TransformCallback): void {
    if (file.state === null) cb()

    // If the file doesn't exists yet there isn't any diff
    const filePath = path.resolve(file.path)
    if (!fs.existsSync(filePath)) {
      this.push(file)
      cb()
      return
    }

    this.checkDiff(file)
      .then(status => {
        if (status !== 'skip') this.push(file)

        cb()
      })
      .catch(err => {
        // If the error is an empty string, it means that the user has
        // stopped the prompt with ctrl-c so we return PromptAbortedError
        // to end the program without writing anything to disk
        cb(err || new PromptAbortedError())
      })
  }

  destroy(err?: Error): void {
    if (this._destroyed) return
    this._destroyed = true

    process.nextTick(() => {
      if (err) this.emit('err', err)
      this.emit('close')
    })
  }

  private async checkDiff(file: File): Promise<PromptActions> {
    let newFileContents = file.contents?.toString() ?? ''
    const oldFileContents = fs.readFileSync(path.resolve(file.path)).toString()

    const diff = diffLines(oldFileContents, newFileContents)

    const conflict = diff.some(line => line.added || line.removed)

    if (conflict) {
      let answer = null
      do {
        answer = await enquirer.prompt<PromptAnswer>({
          type: 'select',
          name: 'action',
          message: `The file "${file.path}" has conflicts. What do you want to do?`, // Maybe color file.path
          choices: [
            {name: 'overwrite', message: 'Overwrite', value: 'overwrite'},
            {name: 'skip', message: 'Skip', value: 'skip'},
            {name: 'show', message: 'Show changes', value: 'show'},
          ],
        })

        if (answer?.action === 'show') this.printDiff(diff)
      } while (answer?.action === 'show')

      return answer.action
    }

    return 'identical'
  }

  private printDiff(diff: Change[]) {
    diff.forEach(line => {
      const value = line.value.replace('\n', '')
      if (line.added) {
        console.log(chalk.green(`+ ${value}`))
      } else if (line.removed) {
        console.log(chalk.red(`- ${value}`))
      } else {
        console.log(value)
      }
    })
  }
}
