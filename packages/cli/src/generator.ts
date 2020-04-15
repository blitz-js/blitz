import * as fs from 'fs-extra'
import * as path from 'path'
import {EventEmitter} from 'events'
import {create as createStore, Store} from 'mem-fs'
import {create as createEditor, Editor} from 'mem-fs-editor'
import Enquirer = require('enquirer')

import ConflictChecker from './transforms/conflict-checker'

export interface GeneratorOptions {
  sourceRoot: string
  destinationRoot?: string
  dryRun?: boolean
}

/**
 * The base generator class.
 * Every generator must extend this class.
 */
abstract class Generator<T extends GeneratorOptions = GeneratorOptions> extends EventEmitter {
  private readonly store: Store

  protected readonly fs: Editor
  protected readonly enquirer: Enquirer

  private performedActions: string[] = []

  constructor(protected readonly options: T) {
    super()

    this.store = createStore()
    this.fs = createEditor(this.store)
    this.enquirer = new Enquirer()
    if (!this.options.destinationRoot) this.options.destinationRoot = process.cwd()
  }

  abstract async write(): Promise<void>
  abstract async postWrite(): Promise<void>

  sourcePath(...paths: string[]): string {
    return path.join(this.options.sourceRoot, ...paths)
  }

  destinationPath(...paths: string[]): string {
    return path.join(this.options.destinationRoot!, ...paths)
  }

  async run() {
    if (!this.options.dryRun) {
      await fs.ensureDir(this.options.destinationRoot!)
      process.chdir(this.options.destinationRoot!)
    }

    await this.write()

    await new Promise((resolve, reject) => {
      const conflictChecker = new ConflictChecker({
        dryRun: this.options.dryRun,
      })
      conflictChecker.on('error', err => {
        reject(err)
      })
      conflictChecker.on('fileStatus', (data: string) => {
        this.performedActions.push(data)
      })

      this.fs.commit([conflictChecker], err => {
        if (err) reject(err)
        resolve()
      })
    })

    this.performedActions.forEach(action => {
      console.log(action)
    })

    if (!this.options.dryRun) {
      await this.postWrite()
    }
  }
}

export default Generator
