import * as fs from 'fs-extra'
import * as path from 'path'
import {EventEmitter} from 'events'
import {create as createStore, Store} from 'mem-fs'
import {create as createEditor, Editor} from 'mem-fs-editor'
import Enquirer = require('enquirer')
import {log} from '@blitzjs/server'
import readDirRecursive from 'fs-readdir-recursive'

import ConflictChecker from './transforms/conflict-checker'

export interface GeneratorOptions {
  sourceRoot: string
  destinationRoot?: string
  dryRun?: boolean
  fileContext?: string
}

const ignoredNames = ['.blitz', '.DS_Store', '.git', '.next', '.now', 'node_modules']
const ignoredExtensions = ['.ico', '.png', '.jpg']

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

  abstract async getTemplateValues(): Promise<any>

  replaceTemplateValues(input: string | Buffer, templateValues: any) {
    let result = typeof input === 'string' ? input : input.toString('utf-8')
    for (let templateKey in templateValues) {
      const token = `__${templateKey}__`
      if (result.includes(token)) {
        result = result.replace(new RegExp(token, 'g'), templateValues[templateKey])
      }
    }
    return result
  }

  async write(): Promise<void> {
    const paths = readDirRecursive(this.sourcePath(), (name) => {
      return !ignoredNames.includes(name)
    })

    for (let filePath of paths) {
      try {
        let pathEnding = filePath
        // if context was provided, prepent the context;
        if (this.options.fileContext) {
          pathEnding = path.join(this.options.fileContext, pathEnding)
        }
        const templateValues = await this.getTemplateValues()
        pathEnding = this.replaceTemplateValues(pathEnding, templateValues)

        this.fs.copy(this.sourcePath(filePath), this.destinationPath(pathEnding), {
          process: (input) =>
            new RegExp(`${ignoredExtensions.join('|')}$`).test(pathEnding)
              ? input
              : this.replaceTemplateValues(input, templateValues),
        })
      } catch (error) {
        log.error(`Error generating ${filePath}`)
        throw error
      }
    }
  }

  async postWrite(): Promise<void> {
    // expose postWrite hook, no default implementation
  }

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
      conflictChecker.on('error', (err) => {
        reject(err)
      })
      conflictChecker.on('fileStatus', (data: string) => {
        this.performedActions.push(data)
      })

      this.fs.commit([conflictChecker], (err) => {
        if (err) reject(err)
        resolve()
      })
    })

    this.performedActions.forEach((action) => {
      console.log(action)
    })

    if (!this.options.dryRun) {
      await this.postWrite()
    }
  }
}

export default Generator
