import * as fs from 'fs'
import * as path from 'path'
import {EventEmitter} from 'events'
import {create as createStore, Store} from 'mem-fs'
import {create as createEditor, Editor} from 'mem-fs-editor'
import Enquirer = require('enquirer')

export interface GeneratorOptions {
  sourceRoot: string
  destinationRoot?: string
  yarn?: boolean
  skipInstall?: boolean
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

  constructor(protected readonly options: T) {
    super()

    this.store = createStore()
    this.fs = createEditor(this.store)
    this.enquirer = new Enquirer()
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
  install() {}

  // TODO: Check for conflicts with stream transforms
  // TODO: Handle dry run
  // TODO: Handle errors
  async run() {
    if (!fs.existsSync(this.options.destinationRoot!)) {
      fs.mkdirSync(this.options.destinationRoot!, {recursive: true})
    }
    process.chdir(this.options.destinationRoot!)

    await this.write()

    this.fs.commit(err => {
      console.log(err)
    })
  }
}

export default Generator
