import j from "jscodeshift"
import * as fs from "fs-extra"
import path from "path"

const legacyConvert = async () => {
  let isTypescript = fs.existsSync(path.resolve("tsconfig.json"))
  let blitzConfigFile = `blitz.config.${isTypescript ? "ts" : "js"}`
  let isLegacyBlitz = fs.existsSync(path.resolve(blitzConfigFile))
  let failedAt =
    fs.existsSync(path.resolve(".migration.json")) && fs.readJSONSync("./.migration.json").failedAt

  let steps: {
    name: string
    action: () => void
  }[] = []

  // Add steps in order
  steps.push({
    name: "Rename blitz.config to next.config",
    action: () => fs.renameSync(blitzConfigFile, "next.config.js"),
  })

  steps.push({
    name: "Clear legacy config file and write new one",
    action: () => {
      const nextConfig = path.resolve("next.config.js")
      const fileBuffer = fs.readFileSync(nextConfig)
      const fileSource = fileBuffer.toString("utf-8")
      const program = j(fileSource)
      const parsedProgram = program.get()

      // Clear file
      parsedProgram.value.program.body = []

      // We create an object property eg. {withBlitz: withBlitz}
      let withBlitz = j.objectProperty(j.identifier("withBlitz"), j.identifier("withBlitz"))
      // Then set the shorthand to true so we get {withBlitz}
      withBlitz.shorthand = true

      /* Declare the variable using the object above that equals to a require expression, eg. 
        const {withBlitz} = require("@blitzjs/next")
      */
      let blitzDeclare = j.variableDeclaration("const", [
        j.variableDeclarator(
          j.objectPattern([withBlitz]),
          j.callExpression(j.identifier("require"), [j.stringLiteral("@blitzjs/next")]),
        ),
      ])
      parsedProgram.value.program.body.push(blitzDeclare)

      // Create the module.exports with the withBlitz callExpression and empty arguments. Giving us module.exports = withBlitz()
      let moduleExportExpression = j.expressionStatement(
        j.assignmentExpression(
          "=",
          j.memberExpression(j.identifier("module"), j.identifier("exports")),
          j.callExpression(j.identifier("withBlitz"), []),
        ),
      )
      parsedProgram.value.program.body.push(moduleExportExpression)

      fs.writeFileSync(nextConfig, program.toSource())
    },
  })

  // Loop through steps and run the action
  if (failedAt || failedAt !== false || isLegacyBlitz) {
    for (let [index, step] of steps.entries()) {
      // Ignore previous steps and continue at step that was failed
      if (failedAt && index + 1 !== failedAt) {
        continue
      }
      console.log(`Running ${step.name}...`)
      try {
        step.action()
      } catch (err) {
        console.log(`ERROR: ${err}`)
        failedAt = index + 1
        fs.writeJsonSync(".migration.json", {
          failedAt,
        })
        process.exit(1)
      }
      console.log(`Successfully ran ${step.name}`)
    }

    fs.writeJsonSync(".migration.json", {
      failedAt: false,
    })
  } else {
    if (failedAt === false) {
      console.log("Migration already successful")
      process.exit(0)
    }
    console.log("Legacy blitz config file not found")
  }
}

export {legacyConvert}
