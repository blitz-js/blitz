import * as fs from 'fs-extra'
import * as path from 'path'
import {EventEmitter} from 'events'
import {create as createStore, Store} from 'mem-fs'
import {create as createEditor, Editor} from 'mem-fs-editor'
import Enquirer from 'enquirer'
import {log} from '@blitzjs/server'
import readDirRecursive from 'fs-readdir-recursive'
import * as babel from '@babel/core'
// @ts-ignore TS wants types for this module but none exist
import babelTransformTypescript from '@babel/plugin-transform-typescript'
import {ConflictChecker} from './conflict-checker'
import {parse, print} from 'recast'
import {namedTypes} from 'ast-types/gen/namedTypes'
import * as babelParser from 'recast/parsers/babel'
import getBabelOptions, {Overrides} from 'recast/parsers/_babel_options'
import {ASTNode, visit} from 'ast-types'
import {StatementKind} from 'ast-types/gen/kinds'

export const customTsParser = {
  parse(source: string, options?: Overrides) {
    const babelOptions = getBabelOptions(options)
    babelOptions.plugins.push('typescript')
    babelOptions.plugins.push('jsx')
    return babelParser.parser.parse(source, babelOptions)
  },
}

export interface GeneratorOptions {
  context?: string
  destinationRoot?: string
  dryRun?: boolean
  useTs?: boolean
}

const alwaysIgnoreFiles = ['.blitz', '.DS_Store', '.git', '.next', '.now', 'node_modules']
const ignoredExtensions = ['.ico', '.png', '.jpg']
const tsExtension = /\.(tsx?)$/
const prettierExtensions = /\.(tsx?|jsx?)$/
const templateMatch = /__([A-Za-z_-]*)__/

function getInnerStatements(s?: StatementKind): StatementKind[] {
  if (!s) return []
  if (namedTypes.BlockStatement.check(s)) {
    return s.body
  }
  return [s]
}

/**
 * The base generator class.
 * Every generator must extend this class.
 */
export abstract class Generator<T extends GeneratorOptions = GeneratorOptions> extends EventEmitter {
  private readonly store: Store

  protected readonly fs: Editor
  protected readonly enquirer: Enquirer

  private performedActions: string[] = []
  private useTs: boolean
  private prettier: typeof import('prettier') | undefined

  prettierDisabled: boolean = false

  abstract sourceRoot: string

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

  abstract getTargetDirectory(): string

  filesToIgnore(): string[] {
    // allow subclasses to conditionally ignore certain template files
    // for example, ignoring tsconfig.json in the app generator when
    // generating a plain JS project
    return []
  }

  replaceConditionals(input: string, templateValues: any): string {
    let ast: ASTNode = parse(input, {parser: customTsParser})
    visit(ast, {
      visitIfStatement(this, path) {
        const statement = path.node
        if (namedTypes.MemberExpression.check(statement.test)) {
          if (
            namedTypes.Identifier.check(statement.test.object) &&
            statement.test.object.name === 'process' &&
            namedTypes.Identifier.check(statement.test.property) &&
            templateMatch.test(statement.test.property.name)
          ) {
            const derivedCondition =
              templateValues[statement.test.property.name.match(templateMatch)![1] ?? '']
            if (derivedCondition) {
              path.replace(...getInnerStatements(statement.consequent))
            } else {
              path.replace(...getInnerStatements(statement.alternate || undefined))
            }
          }
        }
        this.traverse(path)
      },
    })
    return print(ast).code
  }

  replaceTemplateValues(input: string, templateValues: any) {
    let result = input
    for (let templateKey in templateValues) {
      const token = `__${templateKey}__`
      if (result.includes(token)) {
        result = result.replace(new RegExp(token, 'g'), templateValues[templateKey])
      }
    }
    return result
  }

  process(
    input: Buffer,
    pathEnding: string,
    templateValues: any,
    prettierOptions: import('prettier').Options | undefined,
  ): string | Buffer {
    if (new RegExp(`${ignoredExtensions.join('|')}$`).test(pathEnding)) {
      return input
    }
    const inputStr = input.toString('utf-8')
    let templatedFile = this.replaceConditionals(inputStr, templateValues)
    if (pathEnding.includes('index')) {
      console.log(inputStr, templatedFile)
    }
    templatedFile = this.replaceTemplateValues(templatedFile, templateValues)
    if (!this.useTs && tsExtension.test(pathEnding)) {
      return (
        babel.transform(templatedFile, {
          plugins: [[babelTransformTypescript, {isTSX: true}]],
        })?.code || ''
      )
    }

    if (
      prettierExtensions.test(pathEnding) &&
      typeof templatedFile === 'string' &&
      this.prettier &&
      !this.prettierDisabled
    ) {
      const options: Record<any, any> = {...prettierOptions}
      if (this.useTs) {
        options.parser = 'babel-ts'
      }
      templatedFile = this.prettier.format(templatedFile, options)
    }
    return templatedFile
  }

  async write(): Promise<void> {
    const paths = readDirRecursive(this.sourcePath(), (name) => {
      const additionalFilesToIgnore = this.filesToIgnore()
      return ![...alwaysIgnoreFiles, ...additionalFilesToIgnore].includes(name)
    })
    try {
      this.prettier = await import('prettier')
    } catch {}
    const prettierOptions = await this.prettier?.resolveConfig(this.sourcePath())

    for (let filePath of paths) {
      try {
        let pathSuffix = filePath
        pathSuffix = path.join(this.getTargetDirectory(), pathSuffix)
        const templateValues = await this.getTemplateValues()

        this.fs.copy(this.sourcePath(filePath), this.destinationPath(pathSuffix), {
          process: (input) => this.process(input, pathSuffix, templateValues, prettierOptions ?? undefined),
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
    return path.join(this.sourceRoot, ...paths)
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
