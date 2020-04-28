import * as fs from 'fs-extra'
import * as path from 'path'
import {EventEmitter} from 'events'
import {create as createStore, Store} from 'mem-fs'
import {create as createEditor, Editor} from 'mem-fs-editor'
import Enquirer = require('enquirer')
import {log} from '@blitzjs/server'
import readDirRecursive from 'fs-readdir-recursive'
import * as babel from '@babel/core'
// @ts-ignore TS wants types for this module but none exist
import babelTransformTypescript from '@babel/plugin-transform-typescript'

import ConflictChecker from './transforms/conflict-checker'

export interface GeneratorOptions {
  sourceRoot: string
  destinationRoot?: string
  dryRun?: boolean
  useTs?: boolean
  fileContext?: string
}

const ignoredNames = ['.blitz', '.DS_Store', '.git', '.next', '.now', 'node_modules']
const ignoredExtensions = ['.ico', '.png', '.jpg']
const tsExtension = /\.(tsx?)$/

/**
 * The base generator class.
 * Every generator must extend this class.
 */
abstract class Generator<T extends GeneratorOptions = GeneratorOptions> extends EventEmitter {
  private readonly store: Store

  protected readonly fs: Editor
  protected readonly enquirer: Enquirer

  private performedActions: string[] = []
  private useTs: boolean

  constructor(protected readonly options: T) {
    super()

    this.store = createStore()
    this.fs = createEditor(this.store)
    this.enquirer = new Enquirer()
    this.useTs =
      typeof this.options.useTs === 'undefined'
        ? fs.existsSync(path.resolve('tsconfig.json'))
        : this.options.useTs
    if (!this.options.destinationRoot) this.options.destinationRoot = process.cwd()
  }

  abstract async getTemplateValues(): Promise<any>

  filesToIgnore(): string[] {
    return []
  }

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

  process(input: Buffer, pathEnding: string, templateValues: any): string | Buffer {
    if (new RegExp(`${ignoredExtensions.join('|')}$`).test(pathEnding)) {
      return input
    }
    const templatedFile = this.replaceTemplateValues(input, templateValues)
    if (!this.useTs && tsExtension.test(pathEnding)) {
      return (
        babel.transform(templatedFile, {
          plugins: [[babelTransformTypescript, {isTSX: true}]],
        })?.code || ''
      )
    }
    return templatedFile
  }

  async write(): Promise<void> {
    const paths = readDirRecursive(this.sourcePath(), (name) => {
      return ![...ignoredNames, ...this.filesToIgnore()].includes(name)
    })

    for (let filePath of paths) {
      try {
        let pathSuffix = filePath
        // if context was provided, prepend the context;
        if (this.options.fileContext) {
          pathSuffix = path.join(this.options.fileContext, pathSuffix)
        }
        const templateValues = await this.getTemplateValues()

        this.fs.copy(this.sourcePath(filePath), this.destinationPath(pathSuffix), {
          process: (input) => this.process(input, pathSuffix, templateValues),
        })
        let templatedPathSuffix = this.replaceTemplateValues(pathSuffix, templateValues)
        if (!this.useTs && tsExtension.test(this.destinationPath(pathSuffix))) {
          templatedPathSuffix = templatedPathSuffix.replace(tsExtension, '.js')
        }
        if (templatedPathSuffix !== pathSuffix) {
          this.fs.move(this.destinationPath(pathSuffix), this.destinationPath(templatedPathSuffix))
        }
      } catch (error) {
        log.error(`Error generating ${filePath}`)
        throw error
      }
    }
  }

  async preCommit(): Promise<void> {
    // expose precommit hook, no default implementation
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
    await this.preCommit()

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
