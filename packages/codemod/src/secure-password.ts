import j from "jscodeshift"
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
const securePasswordBreakingChange = async () => {
  const appDir = path.resolve("src")
  let failedAt =
    fs.existsSync(path.resolve(".migration.json")) && fs.readJSONSync("./.migration.json").failedAt
  let collectedErrors: {message: string; step: number}[] = []
  let steps: Step[] = []

  // Add steps in order
  steps.push({
    name: "update secure-password import",
    action: async () => {
      getAllFiles(appDir, [], [], [".ts", ".tsx", ".js", ".jsx"]).forEach((file) => {
        try {
          // convert import {SecurePassword} from "@blitzjs/auth" to import {SecurePassword} from "@blitzjs/auth/secure-password"
          const program = getCollectionFromSource(file)

          const securePasswordImport = j.importDeclaration(
            [j.importSpecifier(j.identifier("SecurePassword"))],
            j.stringLiteral("@blitzjs/auth/secure-password"),
          )

          const findImports = program.find(j.ImportDeclaration, (node) => node)
          const securePasswordImportExists = findImports.find(j.ImportSpecifier, {
            imported: {name: "SecurePassword"},
          })

          if (securePasswordImportExists.length) {
            //remove the existing import
            securePasswordImportExists.remove()

            //check if import "@blitzjs/auth" exists
            const authImportExists = findImports.find(j.ImportDeclaration, {
              source: {value: "@blitzjs/auth"},
            })
            if (authImportExists.length) {
              //remove the existing import
              authImportExists.remove()
            }
            findImports.at(0).insertBefore(securePasswordImport)
            fs.writeFileSync(path.join(path.resolve(file)), program.toSource())
          }
        } catch (e) {
          log.error(`Error in updating secure-password imports in the ${file}`)
          if (typeof e === "string") {
            throw new Error(e)
          }
        }
      })
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

export {securePasswordBreakingChange}
