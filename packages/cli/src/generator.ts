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
  yarn?: boolean
  install?: boolean
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
  makeDir: (path: fs.PathLike, options?: string | number | fs.MakeDirectoryOptions | null | undefined) => void

  constructor(protected readonly options: T) {
    super()

    this.store = createStore()
    this.fs = createEditor(this.store)
    this.enquirer = new Enquirer()
    this.makeDir = fs.mkdirSync
    if (!this.options.destinationRoot) this.options.destinationRoot = process.cwd()
  }

  abstract async write(): Promise<void>

  sourcePath(...paths: string[]): string {
    return path.join(this.options.sourceRoot, ...paths)
  }

  destinationPath(...paths: string[]): string {
    return path.join(this.options.destinationRoot!, ...paths)
  }

  // TODO: Install all the packages with npm or yarn
  async install() {}

  // TODO: Check for conflicts with stream transforms
  // TODO: Handle dry run
  async run() {
    await fs.ensureDir(this.options.destinationRoot!)

    process.chdir(this.options.destinationRoot!)

    await this.write()

    await new Promise((resolve, reject) => {
      const conflictChecker = new ConflictChecker()
      conflictChecker.on('error', err => {
        reject(err)
      })

      this.fs.commit([conflictChecker], err => {
        if (err) reject(err)
        resolve()
      })
    })

    if (this.options.install) await this.install()
  }
}

export default Generator
