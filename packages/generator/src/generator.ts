import * as babel from "@babel/core"
// @ts-ignore TS wants types for this module but none exist
import babelTransformTypescript from "@babel/plugin-transform-typescript"
import {escapePath} from "fast-glob"
import Enquirer from "enquirer"
import {EventEmitter} from "events"
import * as fs from "fs-extra"
import j, {ImportSpecifier} from "jscodeshift"
import {createFieldTemplateValues, IBuilder} from "./generators/template-builders/builder"
import {NullBuilder} from "./generators/template-builders/null-builder"
import {create as createStore, Store} from "mem-fs"
import {create as createEditor, Editor} from "mem-fs-editor"
import * as path from "path"
import getBabelOptions, {Overrides} from "recast/parsers/_babel_options"
import * as babelParser from "recast/parsers/babel"
import {ConflictChecker} from "./conflict-checker"
import {pipe} from "./utils/pipe"
import {readdirRecursive} from "./utils/readdir-recursive"
import prettier from "prettier"
import {log} from "./utils/log"
import {capitalize, singleCamel} from "./utils/inflector"
const debug = require("debug")("blitz:generator")

export const customTsParser = {
  parse(source: string, options?: Overrides) {
    const babelOptions = getBabelOptions(options)
    babelOptions.plugins.push("typescript")
    babelOptions.plugins.push("jsx")
    return babelParser.parser.parse(source, babelOptions)
  },
}

export interface GeneratorOptions {
  context?: string
  destinationRoot?: string
  templateDir?: string
  dryRun?: boolean
  useTs?: boolean
}

export interface SourceRootType {
  type: "template" | "absolute"
  path: string
}

const alwaysIgnoreFiles = [".blitz", ".DS_Store", ".git", ".next", ".now", "node_modules"]
const ignoredExtensions = [".ico", ".png", ".jpg"]
const tsExtension = /\.(tsx?|ts?)$/
const codeFileExtensions = /\.(tsx?|jsx?)$/

function getStatements(node: j.BlockStatement | j.Statement): j.Statement[] {
  return j.BlockStatement.check(node) ? node.body : [node]
}

function replaceConditionalNode(
  path: j.ASTPath<j.IfStatement | j.ConditionalExpression>,
  templateValues: any,
) {
  // @ts-ignore
  const condition = path.node.test.property.name
  if (!Object.keys(templateValues).includes(condition)) return
  const derivedCondition = templateValues[condition]
  if (derivedCondition) {
    j(path).replaceWith(getStatements(path.node.consequent))
  } else {
    if (path.node.alternate) {
      j(path).replaceWith(getStatements(path.node.alternate))
    } else {
      j(path).remove()
    }
  }
}

// process any template expressions that access process.env, but bypass any
// expressions that aren't targeting templateValues so templates can include
// checks for other env variables
function replaceConditionalStatements(
  program: j.Collection<j.Program>,
  templateValues: any,
): j.Collection<j.Program> {
  const processEnvRequirements = {
    test: {
      object: {
        object: {name: "process"},
        property: {name: "env"},
      },
    },
  }
  program
    .find(j.IfStatement, processEnvRequirements)
    .forEach((path) => replaceConditionalNode(path, templateValues))
  program
    .find(j.ConditionalExpression, processEnvRequirements)
    .forEach((path) => replaceConditionalNode(path, templateValues))
  return program
}

function replaceJsxConditionals(program: j.Collection<j.Program>, templateValues: any) {
  program.find(j.JSXIdentifier, {name: "if"}).forEach((path) => {
    if (j.JSXOpeningElement.check(path.parent.node)) {
      const conditionPath = j(path.parent)
        .find(j.JSXAttribute, {name: {name: "condition"}})
        .at(0)
      const condition = (conditionPath.paths()[0]?.value.value! as j.StringLiteral).value
      if (!Object.keys(templateValues).includes(condition)) return
      const useConsequent = templateValues[condition]
      const innerElements = path.parent.parent.node.children.filter(
        j.JSXElement.check.bind(j.JSXElement),
      )
      const consequent = innerElements[0]
      const alternate =
        innerElements[1] &&
        j(innerElements[1]).paths()[0]?.node.children.filter(j.JSXElement.check.bind(j.JSXElement))
      const result = useConsequent ? consequent : alternate
      if (!result) {
        j(path.parent.parent).remove()
      } else {
        j(path.parent.parent).replaceWith(result)
      }
    }
  })
  return program
}

/**
 * The base generator class.
 * Every generator must extend this class.
 */
export abstract class Generator<
  T extends GeneratorOptions = GeneratorOptions,
> extends EventEmitter {
  private readonly store: Store

  protected readonly fs: Editor
  protected readonly enquirer: Enquirer

  private performedActions: string[] = []
  private useTs: boolean
  private prettier: typeof import("prettier") | undefined

  prettierDisabled: boolean = false
  unsafe_disableConflictChecker = false
  returnResults: boolean = false

  /**
   * When `type: 'absolute'`, it's an absolute path
   * When `type: 'template'`, is the path type `templates/`.
   *
   * @example {type: 'absolue', path: './src/app'} => `./src/app`
   * @example {type: 'template', path: 'app'} => `templates/app`
   */
  abstract sourceRoot: SourceRootType

  constructor(protected readonly options: T) {
    super()

    this.options = options
    this.store = createStore()
    this.fs = createEditor(this.store)
    this.enquirer = new Enquirer()
    this.prettier = prettier
    this.useTs =
      typeof this.options.useTs === "undefined"
        ? fs.existsSync(path.resolve("tsconfig.json"))
        : this.options.useTs
    if (!this.options.destinationRoot) this.options.destinationRoot = process.cwd()
  }

  // abstract getTemplateValues(): Promise<any>
  public templateValuesBuilder: IBuilder<T, any> = NullBuilder

  async getTemplateValues(): Promise<any> {
    const values = await this.templateValuesBuilder.getTemplateValues(this.options)
    return values
  }

  public fieldTemplateRegExp: RegExp = new RegExp(
    /({?\/\*\s*template: (.*) \*\/}?|\s*\/\/\s*template: (.*))/g,
  )

  abstract getTargetDirectory(): string

  filesToIgnore(): string[] {
    // allow subclasses to conditionally ignore certain template files
    // for example, ignoring tsconfig.json in the app generator when
    // generating a plain JS project
    return []
  }

  replaceConditionals(
    input: string,
    templateValues: any,
    prettierOptions: import("prettier").Options = {},
  ): string {
    const source = j(input, {parser: customTsParser})
    const program = source.find(j.Program)
    const result = pipe(replaceConditionalStatements, replaceJsxConditionals)(
      program,
      templateValues,
    )
    return result.toSource({...prettierOptions, lineTerminator: "\n"})
  }

  replaceTemplateValues(input: string, templateValues: any) {
    let result = input
    // console.log("templateValues", templateValues)
    for (let templateKey in templateValues) {
      const token = `__${templateKey}__`
      if (result.includes(token)) {
        result = result.replace(new RegExp(token, "g"), templateValues[templateKey])
      }
    }
    // console.log(templateValues.fieldTemplateValues)
    for (let templateKey in templateValues.fieldTemplateValues) {
      const token = `__${templateKey}__`
      if (result.includes(token)) {
        result = result.replace(new RegExp(token, "g"), templateValues[templateKey])
      }
    }
    return result
  }

  process(
    input: Buffer,
    pathEnding: string,
    templateValues: any,
    prettierOptions: import("prettier").Options | undefined,
  ): string | Buffer {
    debug("Generator.process...")
    if (new RegExp(`${ignoredExtensions.join("|")}$`).test(pathEnding)) {
      return input
    }
    const inputStr = input.toString("utf-8")
    let templatedFile = inputStr

    if (codeFileExtensions.test(pathEnding)) {
      templatedFile = this.replaceConditionals(inputStr, templateValues, prettierOptions || {})
    }
    const fieldTemplateString = templatedFile
      ?.match(this.fieldTemplateRegExp)
      ?.at(0)
      ?.replace(this.fieldTemplateRegExp, "$2$3")

    if (fieldTemplateString) {
      const fieldTemplatePosition = templatedFile.search(this.fieldTemplateRegExp)
      templatedFile = [
        templatedFile.slice(0, fieldTemplatePosition),
        ...(templateValues.fieldTemplateValues?.map((values: any) =>
          this.replaceTemplateValues(fieldTemplateString, values),
        ) || []),
        templatedFile.slice(fieldTemplatePosition),
      ].join("")
    }
    templatedFile = this.replaceTemplateValues(templatedFile, templateValues)
    if (!this.useTs && tsExtension.test(pathEnding)) {
      templatedFile =
        babel.transform(templatedFile, {
          configFile: false,
          plugins: [[babelTransformTypescript, {isTSX: true}]],
        })?.code || ""
    }

    if (
      codeFileExtensions.test(pathEnding) &&
      typeof templatedFile === "string" &&
      this.prettier &&
      !this.prettierDisabled
    ) {
      const options: Record<any, any> = {...prettierOptions}
      if (this.useTs) {
        options.parser = "babel-ts"
      } else {
        options.parser = "babel"
      }
      try {
        templatedFile = this.prettier.format(templatedFile, options)
      } catch (error) {
        console.error(`Failed trying to run prettier: ` + error)
      }
    }
    return templatedFile
  }

  async write(): Promise<void> {
    debug("Generator.write...")
    const sourcePath = this.sourcePath()
    const paths = await readdirRecursive(sourcePath, (name) => {
      const additionalFilesToIgnore = this.filesToIgnore()
      return ![...alwaysIgnoreFiles, ...additionalFilesToIgnore].includes(name)
    })
    const prettierOptions = await this.prettier?.resolveConfig(sourcePath)
    for (let filePath of paths) {
      try {
        let pathSuffix = filePath
        let templateValues = await this.getTemplateValues()
        pathSuffix = path.join(this.getTargetDirectory(), pathSuffix)
        let sourcePath = this.sourcePath(filePath)
        let destinationPath = this.destinationPath(pathSuffix)
        let templatedPathSuffix = this.replaceTemplateValues(pathSuffix, templateValues)
        let templatedDestinationPath = this.destinationPath(templatedPathSuffix)
        const destinationExists = fs.existsSync(templatedDestinationPath)
        if (templatedPathSuffix.includes("pages") && templateValues.parentModelId) {
          const modelPages = fs.existsSync(`pages/${templateValues.modelNames}`)
          if (modelPages) {
            if (
              !fs.existsSync(
                `pages/${templateValues.parentModels}/${templateValues.parentModelParam}/${templateValues.modelNames}`,
              )
            ) {
              fs.moveSync(
                `pages/${templateValues.modelNames}`,
                `pages/${templateValues.parentModels}/${templateValues.parentModelParam}/${templateValues.modelNames}`,
              )
            }
          }
        }
        if (
          (templatedPathSuffix.match(/components/g) ||
            templatedPathSuffix.match(/.*mutations.*create.*/g)) &&
          templateValues.parentModelId
        ) {
          const newFieldTemplateValues = await createFieldTemplateValues(
            templateValues.parentModelId,
            templateValues.parentModelIdZodType,
            true,
          )
          if (templateValues.fieldTemplateValues) {
            templateValues.fieldTemplateValues.push(newFieldTemplateValues)
          } else {
            templateValues.fieldTemplateValues = [newFieldTemplateValues]
          }
        }
        if (templatedPathSuffix.match(/mutations|queries/g)) {
          if (this.fs.exists(templatedPathSuffix)) {
            const program = j(this.fs.read(templatedPathSuffix) as any, {
              parser: customTsParser,
            })
            const importDb = program.find(j.ImportDeclaration).filter((path) => {
              return path.value.source.value === "db"
            })
            importDb.replaceWith((path) => {
              path.value.source.value = "__prismaFolder__"
              return path.value
            })
            this.fs.write(templatedPathSuffix, program.toSource())
          }
        }
        if (!this.useTs && tsExtension.test(this.destinationPath(pathSuffix))) {
          templatedPathSuffix = templatedPathSuffix.replace(tsExtension, ".js")
        }

        if (destinationExists) {
          const newContent = this.process(
            this.fs.read(templatedDestinationPath, {raw: true}) as any,
            pathSuffix,
            templateValues,
            prettierOptions ?? undefined,
          )
          this.fs.write(templatedDestinationPath, newContent)
        } else {
          this.fs.copy(escapePath(sourcePath), escapePath(destinationPath), {
            process: (input) =>
              this.process(input, pathSuffix, templateValues, prettierOptions ?? undefined),
          })

          if (templatedPathSuffix !== pathSuffix) {
            this.fs.move(destinationPath, templatedDestinationPath)
          }
        }
        if (templatedPathSuffix.match(/components/g) && templateValues.parentModelId) {
          let program = j(this.fs.read(templatedDestinationPath), {
            parser: customTsParser,
          })
          const importExists = program
            .find(j.ImportDeclaration)
            .filter((path) => path.node.source.value === "app/core/components/LabelSelectField")
            .size()
          if (!importExists) {
            program
              .find(j.ImportDeclaration)
              .at(-1)
              .insertAfter(
                j.importDeclaration(
                  [j.importSpecifier(j.identifier("LabeledSelectField"))],
                  j.literal("app/core/components/LabelSelectField"),
                ),
              )
          }
          program
            .find(j.ImportDeclaration)
            .at(-1)
            .insertAfter(
              j.importDeclaration(
                [
                  j.importDefaultSpecifier(
                    j.identifier(
                      singleCamel("get" + capitalize(templateValues.parentModelId)).replace(
                        "Id",
                        "s",
                      ),
                    ),
                  ),
                ],
                j.literal(
                  `app/${templateValues.parentModelId.replace("Id", "s")}/queries/${
                    "get" + capitalize(templateValues.parentModelId).replace("Id", "s")
                  }`,
                ),
              ),
            )
          // add import {usePaginatedQuery} from "@blitzjs/rpc" if it doesn't exist
          const importPaginatedQuery = program
            .find(j.ImportDeclaration)
            .filter((path) => {
              if (path.node.specifiers) {
                return (
                  path.node.source.value === "@blitzjs/rpc" &&
                  path.node.specifiers.filter((specifier) => {
                    if (specifier.type === "ImportSpecifier") {
                      return specifier.imported.name === "usePaginatedQuery"
                    } else {
                      return false
                    }
                  }).length > 0
                )
              } else {
                return false
              }
            })
            .size()
          if (!importPaginatedQuery) {
            program
              .find(j.ImportDeclaration)
              .at(-1)
              .insertAfter(
                j.importDeclaration(
                  [j.importSpecifier(j.identifier("usePaginatedQuery"))],
                  j.literal("@blitzjs/rpc"),
                ),
              )
          }
          const projectFormSuspense = program.find(j.FunctionDeclaration).filter((path) => {
            return path.node.id?.name === "ProjectFormSuspense"
          })
          if (projectFormSuspense.size()) {
            projectFormSuspense
              .find(j.ReturnStatement)
              .at(-1)
              .insertBefore(
                j.variableDeclaration("const", [
                  j.variableDeclarator(
                    j.arrayPattern([
                      j.objectPattern([
                        j.objectProperty(
                          j.identifier(`${templateValues.parentModelId.replace("Id", "s")}`),
                          j.identifier(`${templateValues.parentModelId.replace("Id", "s")}`),
                        ),
                      ]),
                    ]),
                    j.callExpression(j.identifier("usePaginatedQuery"), [
                      j.identifier(
                        "get" + capitalize(templateValues.parentModelId).replace("Id", "s"),
                      ),
                      j.objectExpression([
                        j.objectProperty(
                          j.identifier("orderBy"),
                          j.objectExpression([
                            j.objectProperty(j.identifier("id"), j.stringLiteral("asc")),
                          ]),
                        ),
                      ]),
                    ]),
                  ),
                ]),
              )
            this.fs.write(templatedPathSuffix, program.toSource())
          }
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

  preventFileFromLogging(_path: string): boolean {
    // no default implementation
    return false
  }

  sourcePath(...paths: string[]): string {
    if (this.sourceRoot.type === "absolute") {
      return path.join(this.sourceRoot.path, ...paths)
    } else {
      return path.join(
        __dirname,
        "..",
        process.env.NODE_ENV === "test" ? "./templates" : "./dist/templates",
        this.sourceRoot.path,
        ...paths,
      )
    }
  }

  destinationPath(...paths: string[]): string {
    return path.join(this.options.destinationRoot!, ...paths)
  }

  async run(): Promise<string | void> {
    debug("Generator.run...", {options: this.options})
    if (!this.options.dryRun) {
      await fs.ensureDir(this.options.destinationRoot!)
      process.chdir(this.options.destinationRoot!)
    }

    await this.write()
    await this.preCommit()

    if (this.unsafe_disableConflictChecker) {
      await new Promise((resolve, reject) => {
        try {
          this.fs.commit(resolve)
        } catch (err) {
          reject(err)
        }
      })
    } else {
      await new Promise<void>((resolve, reject) => {
        const conflictChecker = new ConflictChecker({
          dryRun: this.options.dryRun,
        })
        conflictChecker.on("error", (err) => {
          reject(err)
        })
        conflictChecker.on("fileStatus", (data: string) => {
          this.performedActions.push(data)
        })

        this.fs.commit([conflictChecker], (err) => {
          if (err) reject(err)
          resolve()
        })
      })
    }

    if (!this.returnResults) {
      this.performedActions
        .sort()
        .filter((action) => {
          // Each action is something like this:
          // "\u001b[32mCREATE   \u001b[39m .env"
          const path = action.split(/ +/g).pop() as string
          return !this.preventFileFromLogging(path)
        })
        .forEach((action) => console.log(action))
    }

    if (!this.options.dryRun) {
      await this.postWrite()
    }

    if (this.returnResults) {
      return this.performedActions.join("\n")
    }
  }
}
