import j, {
  Identifier,
  MemberExpression,
  ObjectExpression,
  ObjectProperty,
  StringLiteral,
} from "jscodeshift"
import * as fs from "fs-extra"
import path from "path"
import {findImport, getAllFiles, getCollectionFromSource} from "./utils"
import {log} from "blitz"

class ExpectedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "Expected Error"
  }
}

type Step = {name: string; action: (stepIndex: number) => Promise<void>}
const eslintBreakingChange = async () => {
  const appDir = path.resolve("src")
  let failedAt =
    fs.existsSync(path.resolve(".migration.json")) && fs.readJSONSync("./.migration.json").failedAt
  let collectedErrors: {message: string; step: number}[] = []
  let steps: Step[] = []

  // Add steps in order
  steps.push({
    name: "update .eslintrc.js configuration",
    action: async (stepIndex) => {
      if (fs.existsSync(path.resolve(".eslintrc.js"))) {
        const program = getCollectionFromSource(".eslintrc.js")
        const parsedProgram = program.get()
        let hasExtends = false
        // check the value of the right side of the assignment of module.exports
        const moduleExports = program.find(j.AssignmentExpression, {
          left: {
            type: "MemberExpression",
            object: {
              type: "Identifier",
              name: "module",
            },
            property: {
              type: "Identifier",
              name: "exports",
            },
          },
        })
        if (moduleExports.length) {
          const moduleExportsValue: ObjectExpression = moduleExports.get().value.right
          if (moduleExportsValue.type === "ObjectExpression") {
            const rules = moduleExportsValue.properties.find(
              (p) => ((p as ObjectProperty).key as StringLiteral).value === "extends",
            ) as ObjectProperty
            if (rules) {
              const rulesValue = rules.value
              if (
                rulesValue.type === "CallExpression" &&
                (rulesValue.callee as MemberExpression).property.type === "Identifier" &&
                (rulesValue.arguments[0] as StringLiteral).value === "@blitzjs/next/eslint"
              ) {
                moduleExportsValue.properties.splice(
                  moduleExportsValue.properties.indexOf(rules),
                  1,
                )
                moduleExportsValue.properties.unshift(
                  j.objectProperty(j.stringLiteral("extends"), j.stringLiteral("blitz-next")),
                )
                hasExtends = true
              } else if (rulesValue.type === "ArrayExpression") {
                const rulesValueElements = rulesValue.elements
                const requireResolve = rulesValueElements.find((e) => {
                  if (e?.type === "CallExpression") {
                    const callee = e.callee
                    if (
                      callee.type === "MemberExpression" &&
                      (callee.object as Identifier).name === "require"
                    ) {
                      const property = callee.property
                      if (property.type === "Identifier" && property.name === "resolve") {
                        const args = e.arguments
                        if (args.length === 1 && args[0]?.type === "StringLiteral") {
                          const arg = args[0]
                          if (arg.value === "@blitzjs/next/eslint") {
                            return true
                          }
                        }
                      }
                    }
                  }
                  return false
                })
                if (requireResolve) {
                  rulesValueElements.splice(rulesValueElements.indexOf(requireResolve), 1)
                  rulesValueElements.push(j.stringLiteral("blitz-next"))
                  hasExtends = true
                }
              }
            }
          }
          if (!hasExtends) {
            parsedProgram.value.program.body = []
            const moduleExport = j.expressionStatement(
              j.assignmentExpression(
                "=",
                j.memberExpression(j.identifier("module"), j.identifier("exports")),
                j.objectExpression([
                  j.objectProperty(j.stringLiteral("extends"), j.stringLiteral("blitz-next")),
                  j.objectProperty(j.stringLiteral("rules"), j.objectExpression([])),
                ]),
              ),
            )
            parsedProgram.value.program.body.push(moduleExport)
          }
          console.log("Program", program.toSource())
          fs.writeFileSync(".eslintrc.js", program.toSource())
          throw new Error("For testing")
        } else {
          collectedErrors.push({
            message: ".eslintrc.js does not exist",
            step: stepIndex,
          })
        }
      }
    },
  })
  // Loop through steps and run the action
  if ((failedAt && failedAt < steps.length) || failedAt !== "SUCCESS") {
    for (let [index, step] of steps.entries()) {
      // Ignore previous steps and continue at step that was failed
      if (failedAt && index + 1 < failedAt) {
        continue
      }
      const spinner = log.spinner(log.withBrand(`Running ${step.name}...`)).start()
      try {
        await step.action(index)
        if (collectedErrors.filter((e) => e.step === index).length) {
          // Soft stored error
          spinner.fail(`${step.name}`)
        } else {
          spinner.succeed(`Successfully ran ${step.name}`)
        }
      } catch (err) {
        // Hard exit error
        const error = err as {code: string} | string
        spinner.fail(`${step.name}`)
        log.error(error as string)

        if (error && typeof error === "object" && error.code === "BABEL_PARSE_ERROR") {
          log.error(
            log.withBrand(
              "Don't panic, go to the file with the error & manually fix it. Then run the codemod again. It will continue where it left off.",
            ),
          )
        } else if (!(err instanceof ExpectedError)) {
          log.error(
            log.withBrand(
              "This is an unexpected error. Please ask for help in the discord #general-help channel. https://discord.blitzjs.com",
            ),
          )
        }
        failedAt = index + 1
        fs.writeJsonSync(".migration.json", {
          failedAt,
        })
        process.exit(1)
      }
    }
    if (collectedErrors.length) {
      for (const error of collectedErrors) {
        log.error(`⚠️  ${error.message}`)
      }
    }
    fs.writeJsonSync(".migration.json", {
      failedAt: "SUCCESS",
    })
  } else {
    if (failedAt === "SUCCESS") {
      log.withBrand("Migration already successful")
      process.exit(0)
    }
  }
}

export {eslintBreakingChange}
