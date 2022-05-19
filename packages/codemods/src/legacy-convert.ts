import j, {ImportDeclaration} from "jscodeshift"
import * as fs from "fs-extra"
import path from "path"
import {parseSync} from "@babel/core"

const legacyConvert = async () => {
  let isTypescript = fs.existsSync(path.resolve("tsconfig.json"))
  let blitzConfigFile = `blitz.config.${isTypescript ? "ts" : "js"}`
  let isLegacyBlitz = fs.existsSync(path.resolve(blitzConfigFile))
  const appDir = path.resolve("app")
  let failedAt =
    fs.existsSync(path.resolve(".migration.json")) && fs.readJSONSync("./.migration.json").failedAt

  let steps: {
    name: string
    action: () => Promise<void>
  }[] = []

  // Add steps in order
  steps.push({
    name: "Rename blitz.config to next.config",
    action: async () => fs.renameSync(blitzConfigFile, "next.config.js"),
  })

  steps.push({
    name: "Clear legacy config file and write new one",
    action: async () => {
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
      j.stringLiteral
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
    name: "Update imports",
    action: async () => {
      const appDir = path.resolve("app")

      const specialImports: Record<string, string> = {
        Link: "next/link",
        Image: "next/image",
        Script: "next/script",

        Document: "next/document",
        DocumentHead: "next/document",
        Html: "next/document",
        Main: "next/document",
        BlitzScript: "next/document",

        AuthenticationError: "blitz",
        AuthorizationError: "blitz",
        CSRFTokenMismatchError: "blitz",
        NotFoundError: "blitz",
        formatZodError: "blitz",
        recursiveFormatZodErrors: "blitz",
        validateZodSchema: "blitz",
        enhancePrisma: "blitz",
        ErrorBoundary: "@blitzjs/next",

        paginate: "blitz",
        invokeWithMiddleware: "@blitzjs/rpc",
        passportAuth: "@blitzjs/auth",
        sessionMiddleware: "@blitzjs/auth",
        simpleRolesIsAuthorized: "@blitzjs/auth",
        getSession: "@blitzjz/auth",
        setPublicDataForUser: "@blitzjs/auth",
        SecurePassword: "@blitzjs/auth",
        hash256: "@blitzjs/auth",
        generateToken: "@blitzjs/auth",
        resolver: "@blitzjs/rpc",
        connectMiddleware: "blitz",

        getAntiCSRFToken: "@blitzjs/rpc",
        useSession: "@blitzjs/rpc",
        useAuthenticatedSession: "@blitzjs/rpc",
        useRedirectAuthenticated: "@blitzjs/rpc",
        useAuthorize: "@blitzjs/rpc",
        useQuery: "@blitzjs/rpc",
        usePaginatedQuery: "@blitzjs/rpc",
        useInfiniteQuery: "@blitzjs/rpc",
        useMutation: "@blitzjs/rpc",
        queryClient: "@blitzjs/rpc",
        getQueryKey: "@blitzjs/rpc",
        getInfiniteQueryKey: "@blitzjs/rpc",
        invalidateQuery: "@blitzjs/rpc",
        setQueryData: "@blitzjs/rpc",
        useQueryErrorResetBoundary: "@blitzjs/rpc",
        QueryClient: "@blitzjs/rpc",
        dehydrate: "@blitzjs/rpc",
        invoke: "@blitzjs/rpc",
        Routes: "@blitzjs/next",
        useRouterQuery: "next/router",

        Head: "next/head",

        App: "next/app",

        dynamic: "next/dynamic",
        noSSR: "next/dynamic",

        getConfig: "next/config",
        setConfig: "next/config",

        ErrorComponent: "next/error",
      }

      const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []) => {
        let files = fs.readdirSync(dirPath)
        files.forEach((file) => {
          if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
          } else {
            arrayOfFiles.push(path.join(dirPath, "/", file))
          }
        })
        return arrayOfFiles
      }

      getAllFiles(appDir).forEach((filename) => {
        const filepath = path.resolve(appDir, filename)
        const fileBuffer = fs.readFileSync(filepath)
        const fileSource = fileBuffer.toString("utf-8")
        const program = j(fileSource, {
          parser: {
            parse: (source: string) =>
              parseSync(source, {
                configFile: false,
                plugins: [require(`@babel/plugin-syntax-jsx`)],
                overrides: [
                  {
                    test: [`**/*.ts`, `**/*.tsx`],
                    plugins: [[require(`@babel/plugin-syntax-typescript`), {isTSX: true}]],
                  },
                ],
                filename: filepath, // this defines the loader depending on the extension
                parserOpts: {
                  tokens: true, // recast uses this
                },
              }),
          },
        })
        const parsedProgram = program.get()

        parsedProgram.value.program.body.forEach((e: ImportDeclaration) => {
          if (e.type === "ImportDeclaration") {
            if (e.source.value === "blitz") {
              const specifierIndexesToRemove: number[] = []
              e.specifiers?.slice().forEach((specifier: any, index) => {
                const importedName =
                  specifier.imported.type === "StringLiteral"
                    ? specifier.imported.value
                    : specifier.imported.name
                if (importedName in specialImports) {
                  parsedProgram.value.program.body.unshift(
                    j.importDeclaration(
                      [specifier],
                      j.stringLiteral(specialImports[importedName] as string),
                    ),
                  )
                  specifierIndexesToRemove.push(index)
                }
              })
              // Remove import from original blitz import deconstruct
              specifierIndexesToRemove.reverse().forEach((index) => {
                e.specifiers?.splice(index, 1)
              })
              // Removed left over "import 'blitz';"
              if (!e.specifiers?.length) {
                const index = parsedProgram.value.program.body.indexOf(e)
                parsedProgram.value.program.body.splice(index, 1)
              }
            }
          }
        })
        fs.writeFileSync(filepath, program.toSource())
      })
    },
  })

  steps.push({
    name: "Create server & client setup files",
    action: async () => {
      let appDirExist = fs.existsSync(appDir)

      if (appDirExist) {
        const templatePath = path.join(
          require.resolve("@blitzjs/generator"),
          "..",
          "..",
          "templates",
        )
        const blitzServer = fs
          .readFileSync(path.join(templatePath, "app", "app", "blitz-server.ts"))
          .toString()
        const blitzClient = fs
          .readFileSync(path.join(templatePath, "app", "app", "blitz-client.ts"))
          .toString()

        const replaceTemplateValues = (input: string) => {
          let result = input
          const token = `__safeNameSlug__`
          if (result.includes(token)) {
            result = result.replace(new RegExp(token, "g"), "blitz")
          }
          return result
        }

        fs.writeFileSync(
          `${appDir}/blitz-server.${isTypescript ? "ts" : "js"}`,
          replaceTemplateValues(blitzServer),
        )

        fs.writeFileSync(
          `${appDir}/blitz-client.${isTypescript ? "ts" : "js"}`,
          replaceTemplateValues(blitzClient),
        )
      } else {
        throw new Error("App directory doesn't exit")
      }
    },
  })

  steps.push({
    name: "Create pages/api/rpc dir & [...blitz] wildecard api route for next.js",
    action: async () => {
      const pagesDir = path.resolve("pages/api/rpc")
      const templatePath = path.join(require.resolve("@blitzjs/generator"), "..", "..", "templates")
      const rpcRoute = fs
        .readFileSync(path.join(templatePath, "app", "pages", "api", "rpc", "blitzrpcroute.ts"))
        .toString()

      if (!fs.existsSync(pagesDir)) {
        fs.mkdirSync(pagesDir, {recursive: true})
      }

      fs.writeFileSync(
        path.resolve(`${pagesDir}/[...blitz].${isTypescript ? "ts" : "js"}`),
        rpcRoute,
      )
    },
  })

  steps.push({
    name: "Move pages dir from app dir to the pages dir created above",
    action: async () => {
      const appDir = path.resolve("app")
      const subdirs = fs.readdirSync(appDir)

      if (subdirs.includes("pages")) {
        const appPagesDir = fs.readdirSync(path.join(appDir, "pages"))
        appPagesDir.forEach((dir) => {
          fs.moveSync(
            path.resolve(path.join(appDir, "pages", dir)),
            path.resolve(path.join("pages", dir)),
          )
        })
      }

      // Remove pages dir from the app dir after move is complete
      fs.removeSync(path.join(appDir, "pages"))
    },
  })

  steps.push({
    name: "Remove blitz/babel from babel config file",
    action: async () => {
      const babelConfig = path.resolve("babel.config.js")
      const fileBuffer = fs.readFileSync(babelConfig)
      const fileSource = fileBuffer.toString("utf-8")
      const program = j(fileSource)
      const parsedProgram = program.get()
      parsedProgram.value.program.body[0].expression.right.properties.forEach((e: any) => {
        if (e.key.name === "presets") {
          const elem = e.value.elements.findIndex((e: any) => {
            return e.value === "blitz/babel"
          })
          e.value.elements.splice(elem, 1)
        }
      })

      fs.writeFileSync(babelConfig, program.toSource())
    },
  })

  steps.push({
    name: "Consolidate pages dir",
    action: async () => {
      const getAllPagesDirs = (dirPath: string) => {
        let files = fs.readdirSync(dirPath)

        const pageDir = files.reduce((arr: {model: string; path: string}[], file: string) => {
          if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            let subs = fs.readdirSync(dirPath + "/" + file)
            if (subs.includes("pages")) {
              arr.push({
                model: file,
                path: dirPath + "/" + file + "/pages",
              })
            }
          }
          return arr
        }, [])

        return pageDir
      }

      getAllPagesDirs(appDir).forEach((pages) => {
        fs.moveSync(pages.path, path.join(path.resolve("pages"), pages.model))
      })
    },
  })

  steps.push({
    name: "Move api routes",
    action: async () => {
      const apiRoutesExist = fs.existsSync(path.join(appDir, "api"))
      if (apiRoutesExist) {
        let apiRoutes = fs.readdirSync(path.join(appDir, "api"))
        apiRoutes.forEach((dir) => {
          if (fs.statSync(appDir + "/api/" + dir).isDirectory()) {
            fs.moveSync(appDir + "/api/" + dir, path.join(path.resolve("pages"), "api", dir))
          }
        })
      }
    },
  })

  steps.push({
    name: "Update custom server input",
    action: async () => {
      const customServerDir = path.resolve("server")
      const customServerFile = path.resolve(`server.${isTypescript ? "ts" : "js"}`)

      // If custom server is inside "server" dir
      if (fs.existsSync(customServerDir)) {
        if (fs.readdirSync("server").includes(`index.${isTypescript ? "ts" : "js"}`)) {
          const fileBuffer = fs.readFileSync(
            path.join("server", `index.${isTypescript ? "ts" : "js"}`),
          )
          const fileSource = fileBuffer.toString("utf-8")
          const program = j(fileSource, {
            parser: {
              parse: (source: string) =>
                parseSync(source, {
                  plugins: [require(`@babel/plugin-syntax-jsx`)],
                  overrides: [
                    {
                      test: [`**/*.ts`, `**/*.tsx`],
                      plugins: [[require(`@babel/plugin-syntax-typescript`), {isTSX: true}]],
                    },
                  ],
                  filename: path.join("server", `index.${isTypescript ? "ts" : "js"}`), // this defines the loader depending on the extension
                  parserOpts: {
                    tokens: true, // recast uses this
                  },
                }),
            },
          })

          const findBlitzCall = program.find(
            j.Identifier,
            (node) => node.name === "blitz" || node.escapedText === "blitz",
          )
          const findBlitzCustomServerLiteral = program
            .find(j.StringLiteral, (node) => node.value === "blitz/custom-server")
            .get()

          findBlitzCustomServerLiteral.value.value = "next"
          findBlitzCall.forEach((hit) => {
            // Loops through the blitz calls. Check if its a call expression, require statement or import statement. Will check everything to next instead of blitz
            switch (hit.name) {
              case "callee":
                hit.value.name = "next"
              case "id":
                hit.value.name = "next"
              case "local":
                hit.value.name = "next"
            }
          })

          fs.writeFileSync(
            path.join("server", `index.${isTypescript ? "ts" : "js"}`),
            program.toSource(),
          )
        }
      }

      // If custom server file found outside dir
      if (fs.existsSync(customServerFile)) {
        const fileBuffer = fs.readFileSync(customServerFile)
        const fileSource = fileBuffer.toString("utf-8")
        const program = j(fileSource, {
          parser: {
            parse: (source: string) =>
              parseSync(source, {
                plugins: [require(`@babel/plugin-syntax-jsx`)],
                overrides: [
                  {
                    test: [`**/*.ts`, `**/*.tsx`],
                    plugins: [[require(`@babel/plugin-syntax-typescript`), {isTSX: true}]],
                  },
                ],
                filename: customServerFile, // this defines the loader depending on the extension
                parserOpts: {
                  tokens: true, // recast uses this
                },
              }),
          },
        })
        const findBlitzCall = program.find(
          j.Identifier,
          (node) => node.name === "blitz" || node.escapedText === "blitz",
        )
        const findBlitzCustomServerLiteral = program
          .find(j.StringLiteral, (node) => node.value === "blitz/custom-server")
          .get()

        findBlitzCustomServerLiteral.value.value = "next"
        findBlitzCall.forEach((hit) => {
          // Loops through the blitz calls. Check if its a call expression, require statement or import statement. Will check everything to next instead of blitz
          switch (hit.name) {
            case "callee":
              hit.value.name = "next"
            case "id":
              hit.value.name = "next"
            case "local":
              hit.value.name = "next"
          }
        })
        fs.writeFileSync(customServerFile, program.toSource())
      }
    },
  })

  steps.push({
    name: "Convert useRouterQuery to useRouter",
    action: async () => {
      const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []) => {
        let files = fs.readdirSync(dirPath)
        files.forEach((file) => {
          if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
          } else {
            arrayOfFiles.push(path.join(dirPath, "/", file))
          }
        })
        return arrayOfFiles
      }

      //First check ./pages
      const pagesDir = path.resolve("pages")
      getAllFiles(pagesDir).forEach((file) => {
        const filepath = path.resolve(pagesDir, file)
        const fileBuffer = fs.readFileSync(filepath)
        const fileSource = fileBuffer.toString("utf-8")
        const program = j(fileSource, {
          parser: {
            parse: (source: string) =>
              parseSync(source, {
                plugins: [require(`@babel/plugin-syntax-jsx`)],
                overrides: [
                  {
                    test: [`**/*.ts`, `**/*.tsx`],
                    plugins: [[require(`@babel/plugin-syntax-typescript`), {isTSX: true}]],
                  },
                ],
                filename: filepath, // this defines the loader depending on the extension
                parserOpts: {
                  tokens: true, // recast uses this
                },
              }),
          },
        })

        const parsedProgram = program.get()
        const findRouterQueryImport = program.find(
          j.ImportDeclaration,
          (node) => node.source.value === "next/router",
        )
        findRouterQueryImport.forEach((node) => {
          const getNode = node.get()
          getNode.value.specifiers.slice().forEach((specifier: any, index: number) => {
            const importedName =
              specifier.imported.type === "StringLiteral"
                ? specifier.imported.value
                : specifier.imported.name
            if (importedName === "useRouterQuery") {
              parsedProgram.value.program.body.unshift(
                j.importDeclaration(
                  [j.importSpecifier(j.identifier("useRouter"))],
                  j.stringLiteral("next/router"),
                ),
              )
              getNode.value.specifiers.splice(index, 1)
              // Removed left overs
              if (!getNode.value.specifiers?.length) {
                const index = parsedProgram.value.program.body.indexOf(getNode.value)
                parsedProgram.value.program.body.splice(index, 1)
              }
            }
          })
        })

        const findCallUseRouterQuery = program.find(
          j.CallExpression,
          (node) => node.callee.name === "useRouterQuery",
        )
        findCallUseRouterQuery.forEach((call) => {
          const nodePath = call.get()
          nodePath.parentPath.value.init = j.expressionStatement(
            j.memberExpression(
              j.callExpression(j.identifier("useRouter"), []),
              j.identifier("query"),
            ),
          )
        })

        fs.writeFileSync(filepath, program.toSource())
      })

      getAllFiles(appDir).forEach((file) => {
        const filepath = path.resolve(appDir, file)
        const fileBuffer = fs.readFileSync(filepath)
        const fileSource = fileBuffer.toString("utf-8")
        const program = j(fileSource, {
          parser: {
            parse: (source: string) =>
              parseSync(source, {
                plugins: [require(`@babel/plugin-syntax-jsx`)],
                overrides: [
                  {
                    test: [`**/*.ts`, `**/*.tsx`],
                    plugins: [[require(`@babel/plugin-syntax-typescript`), {isTSX: true}]],
                  },
                ],
                filename: filepath, // this defines the loader depending on the extension
                parserOpts: {
                  tokens: true, // recast uses this
                },
              }),
          },
        })

        const parsedProgram = program.get()
        const findRouterQueryImport = program.find(
          j.ImportDeclaration,
          (node) => node.source.value === "next/router",
        )
        findRouterQueryImport.forEach((node) => {
          const getNode = node.get()
          getNode.value.specifiers.slice().forEach((specifier: any, index: number) => {
            const importedName =
              specifier.imported.type === "StringLiteral"
                ? specifier.imported.value
                : specifier.imported.name
            if (importedName === "useRouterQuery") {
              parsedProgram.value.program.body.unshift(
                j.importDeclaration(
                  [j.importSpecifier(j.identifier("useRouter"))],
                  j.stringLiteral("next/router"),
                ),
              )
              getNode.value.specifiers.splice(index, 1)
              // Removed left overs
              if (!getNode.value.specifiers?.length) {
                const index = parsedProgram.value.program.body.indexOf(getNode.value)
                parsedProgram.value.program.body.splice(index, 1)
              }
            }
          })
        })

        const findCallUseRouterQuery = program.find(
          j.CallExpression,
          (node) => node.callee.name === "useRouterQuery",
        )
        findCallUseRouterQuery.forEach((call) => {
          const nodePath = call.get()
          nodePath.parentPath.value.init = j.expressionStatement(
            j.memberExpression(
              j.callExpression(j.identifier("useRouter"), []),
              j.identifier("query"),
            ),
          )
        })

        fs.writeFileSync(filepath, program.toSource())
      })
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
        await step.action()
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
