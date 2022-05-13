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

  steps.push({
    name: "Update package.json",
    action: async () => {
      let packageJsonPath = require(path.resolve("package.json"))
      packageJsonPath.dependencies["react"] = "latest"
      packageJsonPath.dependencies["react-dom"] = "latest"
      packageJsonPath.dependencies["@blitzjs/next"] = "alpha"
      packageJsonPath.dependencies["@blitzjs/rpc"] = "latest"
      packageJsonPath.dependencies["@blitzjs/auth"] = "latest"
      packageJsonPath.dependencies["@blitzjs/auth"] = "alpha"

      fs.writeFileSync(path.resolve("package.json"), JSON.stringify(packageJsonPath, null, " "))
    },
  })

  steps.push({
    name: "Create server & client setup files",
    action: async () => {
      const appDir = path.resolve("app")
      let appDirExist = fs.existsSync(appDir)

      if (appDirExist) {
        fs.writeFileSync(
          `${appDir}/blitz-server.${isTypescript ? "ts" : "js"}`,
          `
          import { setupBlitzServer } from "@blitzjs/next"
          import { AuthServerPlugin, PrismaStorage } from "@blitzjs/auth"
          import { db } from "db"
          import { simpleRolesIsAuthorized } from "@blitzjs/auth"
          
          const { gSSP, gSP, api } = setupBlitzServer({
            plugins: [
              AuthServerPlugin({
                cookiePrefix: "blitz-cookie-prefix",
                // TODO fix type
                storage: PrismaStorage(db${isTypescript && " as any"}),
                isAuthorized: simpleRolesIsAuthorized,
              }),
            ],
          })
          
          export { gSSP, gSP, api }
        `,
        )

        fs.writeFileSync(
          `${appDir}/blitz-client.${isTypescript ? "ts" : "js"}`,
          `
          import { AuthClientPlugin } from "@blitzjs/auth"
          import { setupBlitzClient } from "@blitzjs/next"
          import { BlitzRpcPlugin } from "@blitzjs/rpc"
          
          export const { withBlitz } = setupBlitzClient({
            plugins: [
              AuthClientPlugin({
                cookiePrefix: "blitz-cookie-prefix",
              }),
              BlitzRpcPlugin({
                reactQueryOptions: {
                  queries: {
                    staleTime: 7000,
                  },
                },
              }),
            ],
          })
        `,
        )
      } else {
        throw new Error("App directory doesn't exit")
      }
    },
  })

  steps.push({
    name: "Create pages/api/rpc dir & [...blitz] wildecard api route for next.js",
    action: () => {
      const pagesDir = path.resolve("pages/api/rpc")

      if (!fs.existsSync(pagesDir)) {
        fs.mkdirSync(pagesDir, {recursive: true})
      }

      fs.writeFileSync(
        path.resolve(`${pagesDir}/[...blitz].${isTypescript ? "ts" : "js"}`),
        `
      import { rpcHandler } from "@blitzjs/rpc"
      import { api } from "app/blitz-server"

      export default api(rpcHandler({ onError: console.log }))
      `,
      )
    },
  })

  // Loop through steps and run the action
  if ((failedAt && failedAt < steps.length) || failedAt !== "SUCCESS" || isLegacyBlitz) {
    for (let [index, step] of steps.entries()) {
      // Ignore previous steps and continue at step that was failed
      if (failedAt && index + 1 < failedAt) {
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
      failedAt: "SUCCESS",
    })
  } else {
    if (failedAt === "SUCCESS") {
      console.log("Migration already successful")
      process.exit(0)
    }
    console.log("Legacy blitz config file not found")
  }
}

export {legacyConvert}
