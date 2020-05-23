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
import {StatementKind, ExpressionKind} from 'ast-types/gen/kinds'
import {Context} from 'ast-types/lib/path-visitor'
import {NodePath} from 'ast-types/lib/node-path'

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
const codeFileExtensions = /\.(tsx?|jsx?)$/

function getInnerStatements(s?: StatementKind | ExpressionKind): Array<StatementKind | ExpressionKind> {
  if (!s) return []
  if (namedTypes.BlockStatement.check(s)) {
    return s.body
  }
  return [s]
}

// process any template expressions that access process.env, but bypass any
// expressions that aren't targeting templateValues so templates can include
// checks for other env variables
function conditionalExpressionVisitor(
  this: Context,
  path: NodePath<namedTypes.IfStatement | namedTypes.ConditionalExpression, any>,
  templateValues: any,
): void {
  const statement = path.node
  // only enter if the condition is a compount statement, otherwise
  // it's definitely not a valid template condition
  if (namedTypes.MemberExpression.check(statement.test)) {
    if (
      // condition statement starts with `process.` and has a second accessor
      namedTypes.MemberExpression.check(statement.test.object) &&
      namedTypes.Identifier.check(statement.test.object.object) &&
      statement.test.object.object.name === 'process' &&
      // condition statement continues with `env.`
      namedTypes.Identifier.check(statement.test.object.property) &&
      statement.test.object.property.name === 'env' &&
      // condition ends with valid templateVariable
      namedTypes.Identifier.check(statement.test.property) &&
      Object.keys(templateValues).includes(statement.test.property.name)
    ) {
      const derivedCondition = templateValues[statement.test.property.name]
      if (derivedCondition) {
        path.replace(...getInnerStatements(statement.consequent))
      } else {
        path.replace(...getInnerStatements(statement.alternate || undefined))
      }
    }
  }
  this.traverse(path)
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
    // reassign `this` since recast depends on a bound `this` context
    // in visitors
    visit(ast, {
      visitIfStatement(this, path) {
        conditionalExpressionVisitor.call(this, path, templateValues)
      },
      visitConditionalExpression(this, path) {
        conditionalExpressionVisitor.call(this, path, templateValues)
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
    let templatedFile = inputStr
    if (codeFileExtensions.test(pathEnding)) {
      templatedFile = this.replaceConditionals(inputStr, templateValues)
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
      codeFileExtensions.test(pathEnding) &&
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
