import j, {ImportDeclaration} from "jscodeshift"
import * as fs from "fs-extra"
import path from "path"
import {
  addNamedImport,
  findCallExpression,
  findDefaultExportPath,
  findFunction,
  findImport,
  findVariable,
  getAllFiles,
  getCollectionFromSource,
  wrapDeclaration,
  findIdentifier,
  removeImport,
  replaceImport,
  replaceIdentifiers,
} from "./utils"
import {log} from "blitz"

const isInternalBlitzMonorepoDevelopment = fs.existsSync(
  path.join(__dirname, "../../../blitz-next"),
)

const upgradeLegacy = async () => {
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
    name: "move the config from blitz.config.ts to next.config.js",
    action: async () => {
      const program = getCollectionFromSource(blitzConfigFile)
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
          j.callExpression(j.identifier("withBlitz"), [
            j.objectExpression([j.objectProperty(j.identifier("blitz"), j.objectExpression([]))]),
          ]),
        ),
      )
      parsedProgram.value.program.body.push(moduleExportExpression)

      fs.writeFileSync(path.resolve("next.config.js"), program.toSource())
    },
  })

  steps.push({
    name: "update dependencies in package.json",
    action: async () => {
      let packageJsonPath = require(path.resolve("package.json"))
      packageJsonPath.dependencies["react"] = "latest"
      packageJsonPath.dependencies["react-dom"] = "latest"
      packageJsonPath.dependencies["@blitzjs/next"] = "alpha"
      packageJsonPath.dependencies["@blitzjs/rpc"] = "alpha"
      packageJsonPath.dependencies["@blitzjs/auth"] = "alpha"
      packageJsonPath.dependencies["blitz"] = "alpha"
      packageJsonPath.dependencies["next"] = "latest"
      packageJsonPath.dependencies["prisma"] = "latest"
      packageJsonPath.dependencies["@prisma/client"] = "latest"
      packageJsonPath.devDependencies["typescript"] = isTypescript && "latest"

      fs.writeFileSync(path.resolve("package.json"), JSON.stringify(packageJsonPath, null, " "))
    },
  })

  steps.push({
    name: "update project's imports",
    action: async () => {
      const specialImports: Record<string, string> = {
        NextApiHandler: "next",
        NextApiRequest: "next",
        NextApiResponse: "next",

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
        ErrorFallbackProps: "@blitzjs/next",

        paginate: "blitz",
        invokeWithMiddleware: "@blitzjs/rpc",
        passportAuth: "@blitzjs/auth",
        sessionMiddleware: "@blitzjs/auth",
        simpleRolesIsAuthorized: "@blitzjs/auth",
        getSession: "@blitzjs/auth",
        setPublicDataForUser: "@blitzjs/auth",
        SecurePassword: "@blitzjs/auth",
        hash256: "@blitzjs/auth",
        generateToken: "@blitzjs/auth",
        resolver: "@blitzjs/rpc",
        connectMiddleware: "blitz",
        GetServerSideProps: "next",
        InferGetServerSidePropsType: "next",
        GetServerSidePropsContext: "next",
        AuthenticatedMiddlewareCtx: "@blitz/rpc",
        getAntiCSRFToken: "@blitzjs/rpc",
        useSession: "@blitzjs/auth",
        useAuthenticatedSession: "@blitzjs/auth",
        useRedirectAuthenticated: "@blitzjs/auth",
        SessionContext: "@blitzjs/auth",
        useAuthorize: "@blitzjs/auth",
        useQuery: "@blitzjs/rpc",
        useParam: "@blitzjs/next",
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
        useRouter: "next/router",
        Router: "next/router",

        Head: "next/head",

        App: "next/app",

        dynamic: "next/dynamic",
        noSSR: "next/dynamic",

        getConfig: "next/config",
        setConfig: "next/config",

        ErrorComponent: "@blitzjs/next",
        AppProps: "@blitzjs/next",
        BlitzPage: "@blitzjs/next",
        BlitzLayout: "@blitzjs/next",
      }

      getAllFiles(appDir, [], [], [".ts", ".tsx", ".js", ".jsx"]).forEach((filename) => {
        const program = getCollectionFromSource(path.resolve(appDir, filename))
        const parsedProgram = program.get()

        parsedProgram.value.program.body.forEach((e: ImportDeclaration) => {
          if (e.type === "ImportDeclaration") {
            if (e.source.value === "blitz") {
              e.specifiers?.slice().forEach((specifier: any) => {
                const importedName =
                  specifier.imported.type === "StringLiteral"
                    ? specifier.imported.value
                    : specifier.imported.name
                if (importedName in specialImports) {
                  addNamedImport(program, importedName, specialImports[importedName]!)
                  removeImport(program, importedName, "blitz")
                }
              })
              // Removed left over "import 'blitz';"
              if (!e.specifiers?.length) {
                const index = parsedProgram.value.program.body.indexOf(e)
                parsedProgram.value.program.body.splice(index, 1)
              }
            }
          }
        })
        fs.writeFileSync(path.resolve(appDir, filename), program.toSource())
      })
    },
  })

  steps.push({
    name: "update NextJS' default imports",
    action: async () => {
      getAllFiles(appDir, [], [], [".ts", ".tsx", ".js", ".jsx"]).forEach((file) => {
        const program = getCollectionFromSource(file)

        const nextImage = findImport(program, "next/image")
        const nextLink = findImport(program, "next/link")
        const nextHead = findImport(program, "next/head")

        if (nextImage?.length) {
          nextImage.remove()
          program
            .get()
            .value.program.body.unshift(
              j.importDeclaration(
                [j.importDefaultSpecifier(j.identifier("Image"))],
                j.stringLiteral("next/image"),
              ),
            )
        }

        if (nextLink?.length) {
          nextLink.remove()
          program
            .get()
            .value.program.body.unshift(
              j.importDeclaration(
                [j.importDefaultSpecifier(j.identifier("Link"))],
                j.stringLiteral("next/link"),
              ),
            )
        }

        if (nextHead?.length) {
          nextHead.remove()
          program
            .get()
            .value.program.body.unshift(
              j.importDeclaration(
                [j.importDefaultSpecifier(j.identifier("Head"))],
                j.stringLiteral("next/head"),
              ),
            )
        }

        fs.writeFileSync(path.join(path.resolve(file)), program.toSource())
      })
    },
  })

  steps.push({
    name: "change queryClient to getQueryClient()",
    action: async () => {
      getAllFiles(appDir, [], [], [".ts", ".tsx", ".js", ".jsx"]).forEach((file) => {
        const filepath = path.resolve(appDir, file)
        const program = getCollectionFromSource(filepath)

        const findQueryClient = () => {
          return program.find(j.Identifier, (node) => node.name === "queryClient")
        }

        findQueryClient().forEach((q) => {
          switch (q.name) {
            case "imported":
              q.value.name = "getQueryClient"
              break
            case "object":
              j(q).replaceWith(j.callExpression(j.identifier("getQueryClient"), []))
              break
          }
        })

        fs.writeFileSync(path.resolve(appDir, file), program.toSource())
      })
    },
  })

  steps.push({
    name: "change BlitzApiRequest to NextApiRequest",
    action: async () => {
      getAllFiles(path.join(appDir, "api"), [], [], [".ts", ".tsx", ".js", ".jsx"]).forEach(
        (file) => {
          const program = getCollectionFromSource(file)

          replaceImport(program, "blitz", "BlitzApiRequest", "next", "NextApiRequest")
          replaceIdentifiers(program, "BlitzApiRequest", "NextApiRequest")

          fs.writeFileSync(path.join(path.resolve(file)), program.toSource())
        },
      )
    },
  })

  steps.push({
    name: "change BlitzApiResponse to NextApiResponse",
    action: async () => {
      getAllFiles(path.join(appDir, "api"), [], [], [".ts", ".tsx", ".js", ".jsx"]).forEach(
        (file) => {
          const program = getCollectionFromSource(file)

          replaceImport(program, "blitz", "BlitzApiResponse", "next", "NextApiResponse")
          replaceIdentifiers(program, "BlitzApiResponse", "NextApiResponse")

          fs.writeFileSync(path.join(path.resolve(file)), program.toSource())
        },
      )
    },
  })

  steps.push({
    name: "change BlitzApiHandler to NextApiHandler",
    action: async () => {
      getAllFiles(path.join(appDir, "api"), [], [], [".ts", ".tsx", ".js", ".jsx"]).forEach(
        (file) => {
          const program = getCollectionFromSource(file)

          // BlitzApiHandler -> NextApiHandler
          replaceImport(program, "blitz", "BlitzApiHandler", "next", "NextApiHandler")
          replaceIdentifiers(program, "BlitzApiHandler", "NextApiHandler")

          fs.writeFileSync(path.join(path.resolve(file)), program.toSource())
        },
      )
    },
  })

  steps.push({
    name: "create blitz-server.ts and blitz-client.ts setup files",
    action: async () => {
      let appDirExist = fs.existsSync(appDir)

      if (appDirExist) {
        const templatePath = path.join(
          require.resolve("@blitzjs/generator"),
          "..",
          "..",
          isInternalBlitzMonorepoDevelopment ? "templates" : "dist/templates",
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
    name: "Add cookiePrefix to blitz server",
    action: async () => {
      const blitzConfigProgram = getCollectionFromSource(blitzConfigFile)
      const cookieIdentifier = blitzConfigProgram.find(
        j.Identifier,
        (node) => node.name === "cookiePrefix",
      )
      if (cookieIdentifier.length) {
        const cookiePrefix = cookieIdentifier.get().parentPath.value.value.value
        const blitzClientProgram = getCollectionFromSource(
          path.join(appDir, `blitz-client.${isTypescript ? "ts" : "js"}`),
        )
        const cookieIdentifierBlitzClient = blitzClientProgram.find(
          j.Identifier,
          (node) => node.name === "cookiePrefix",
        )
        cookieIdentifierBlitzClient.get().parentPath.value.value.value = cookiePrefix

        fs.writeFileSync(
          `${appDir}/blitz-client.${isTypescript ? "ts" : "js"}`,
          blitzClientProgram.toSource(),
        )
      } else {
        log.error("Cookie Prefix not found in blitz config file")
      }
    },
  })

  steps.push({
    name: "Move middleware to blitz server file",
    action: async () => {
      const blitzConfigProgram = getCollectionFromSource(blitzConfigFile)
      const middlewareArray = blitzConfigProgram.find(
        j.Identifier,
        (node) => node.name === "middleware",
      )
      if (middlewareArray.length) {
        const middlewares = middlewareArray
          .get()
          .parentPath.value.value.elements.filter((a: any) => a.callee.name !== "sessionMiddleware")
        const blitzServerProgram = getCollectionFromSource(
          path.join(appDir, `blitz-server.${isTypescript ? "ts" : "js"}`),
        )

        const pluginArray = blitzServerProgram.find(j.Identifier, (node) => node.name === "plugins")

        pluginArray.get().parentPath.value.value.elements = [
          ...pluginArray.get().parentPath.value.value.elements,
          ...middlewares,
        ]

        let importStatements = []
        for (let nodes of blitzConfigProgram.get().value.program.body) {
          if (nodes.type === "ImportDeclaration") {
            if (nodes.source.value !== "blitz") {
              importStatements.push(nodes)
            }
          }

          if (nodes.type === "VariableDeclaration") {
            if (
              nodes.declarations &&
              nodes.declarations.some((d: any) => d.init.type === "CallExpression")
            ) {
              importStatements.push(nodes)
            }
          }
        }

        importStatements.forEach((s) =>
          blitzServerProgram
            .get()
            .value.program.body.unshift(j.variableDeclaration(s.kind, s.declarations)),
        )

        fs.writeFileSync(
          `${appDir}/blitz-server.${isTypescript ? "ts" : "js"}`,
          blitzServerProgram.toSource(),
        )
      } else {
        log.error("Middleware array not found in blit config file")
      }
    },
  })

  steps.push({
    name: "create pages/api/rpc directory and add [[...blitz]].ts wildecard API route",
    action: async () => {
      const pagesDir = path.resolve("pages/api/rpc")
      const templatePath = path.join(
        require.resolve("@blitzjs/generator"),
        "..",
        "..",
        isInternalBlitzMonorepoDevelopment ? "templates" : "dist/templates",
      )
      const rpcRoute = fs
        .readFileSync(path.join(templatePath, "app", "pages", "api", "rpc", "blitzrpcroute.ts"))
        .toString()

      if (!fs.existsSync(pagesDir)) {
        fs.mkdirSync(pagesDir, {recursive: true})
      }

      fs.writeFileSync(
        path.resolve(`${pagesDir}/[[...blitz]].${isTypescript ? "ts" : "js"}`),
        rpcRoute,
      )
    },
  })

  steps.push({
    name: "move app/pages/ to the project root pages/ directory",
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
    name: "remove Babel config file",
    action: async () => {
      const babelConfig = fs.existsSync(path.resolve("babel.config.js"))
      if (babelConfig) {
        fs.removeSync(path.resolve("babel.config.js"))
      }
    },
  })

  steps.push({
    name: "move all pages directories to one consolidated directory",
    action: async () => {
      const getAllPagesDirs = (dirPath: string) => {
        let files = fs.readdirSync(dirPath)

        const pageDir = files.reduce(
          (arr: {model: string; path: string; subModel?: string}[], file: string) => {
            if (fs.statSync(dirPath + "/" + file).isDirectory()) {
              let subs = fs.readdirSync(dirPath + "/" + file)

              if (subs.includes("pages")) {
                // Go a level deeper into "pages"
                let subSubs = fs.readdirSync(dirPath + "/" + file + "/pages")

                for (let dir of subSubs) {
                  if (fs.statSync(dirPath + "/" + file + "/pages" + "/" + dir).isDirectory()) {
                    // If directory structure is like: DIRECTORY/PAGES/DIRECTORY
                    if (dir === file) {
                      arr.push({
                        model: file,
                        path: dirPath + "/" + file + "/pages" + "/" + dir,
                      })
                    } else {
                      // If there is another directory that doesn't have the same name
                      arr.push({
                        model: file,
                        subModel: dir,
                        path: dirPath + "/" + file + "/pages" + "/" + dir,
                      })
                    }
                  } else {
                    arr.push({
                      model: file,
                      path: dirPath + "/" + file + "/pages",
                    })
                    break
                  }
                }
              }
            }
            return arr
          },
          [],
        )

        return pageDir
      }

      getAllPagesDirs(appDir).forEach((pages) => {
        if (pages.subModel) {
          // If the directory exists with a sub model (sub page directory), loop through the directory manually move each file/directory
          if (fs.existsSync(path.join(path.resolve("pages"), pages.model))) {
            let subs = fs.readdirSync(pages.path)
            subs.forEach((sub) => {
              fs.moveSync(
                path.join(pages.path, sub),
                path.join(path.resolve("pages"), pages.model, pages.subModel!, sub),
              )
            })
          } else {
            fs.moveSync(pages.path, path.join(path.resolve("pages"), pages.model, pages.subModel))
          }
        } else {
          // If the directory exists without a sub model (sub page directory), loop through the directory manually move each file/directory
          if (fs.existsSync(path.join(path.resolve("pages"), pages.model))) {
            let subs = fs.readdirSync(pages.path)
            subs.forEach((sub) => {
              fs.moveSync(
                path.join(pages.path, sub),
                path.join(path.resolve("pages"), pages.model, sub),
              )
            })
          } else {
            fs.moveSync(pages.path, path.join(path.resolve("pages"), pages.model))
          }
        }
      })

      //Clean up
      getAllPagesDirs(appDir).forEach((page) => {
        let subs = fs.readdirSync(path.join(appDir, page.model))
        if (subs.includes("pages")) {
          fs.removeSync(path.join(appDir, page.model, "pages"))
        }
      })
    },
  })

  steps.push({
    name: "move API routes to pages/api directory",
    action: async () => {
      const apiRoutesExist = fs.existsSync(path.join(appDir, "api"))
      if (apiRoutesExist) {
        let apiRoutes = fs.readdirSync(path.join(appDir, "api"))
        apiRoutes.forEach((dir) => {
          if (fs.statSync(appDir + "/api/" + dir).isDirectory()) {
            fs.moveSync(appDir + "/api/" + dir, path.join(path.resolve("pages"), "api", dir))
          } else {
            fs.moveSync(appDir + "/api/" + dir, path.join(path.resolve("pages"), "api", dir))
          }
        })
      }
    },
  })

  steps.push({
    name: "update custom server to reference Next",
    action: async () => {
      const customServerDir = path.resolve("server")
      const customServerFile = path.resolve(`server.${isTypescript ? "ts" : "js"}`)

      // If custom server is inside "server" dir
      if (fs.existsSync(customServerDir)) {
        if (fs.readdirSync("server").includes(`index.${isTypescript ? "ts" : "js"}`)) {
          const program = getCollectionFromSource(
            path.join("server", `index.${isTypescript ? "ts" : "js"}`),
          )

          const findBlitzCall = program.find(
            j.Identifier,
            (node) => node.name === "blitz" || node.escapedText === "blitz",
          )
          const findBlitzCustomServerLiteral = program.find(
            j.StringLiteral,
            (node) => node.value === "blitz/custom-server",
          )

          if (findBlitzCustomServerLiteral.length === 0) {
            log.error(
              `Failed to find "blitz/custom-server" import in ${customServerDir}/index.${
                isTypescript ? "ts" : "js"
              }. You will need to update your custom server manually.`,
            )
          } else {
            findBlitzCustomServerLiteral.get().value.value = "next"
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
      }

      // If custom server file found outside dir
      if (fs.existsSync(customServerFile)) {
        const program = getCollectionFromSource(customServerFile)
        const findBlitzCall = program.find(
          j.Identifier,
          (node) => node.name === "blitz" || node.escapedText === "blitz",
        )
        const findBlitzCustomServerLiteral = program.find(
          j.StringLiteral,
          (node) => node.value === "blitz/custom-server",
        )

        if (findBlitzCustomServerLiteral.length === 0) {
          log.error(
            `Failed to find "blitz/custom-server" import in ${customServerFile}. You will need to update your custom server manually.`,
          )
        } else {
          findBlitzCustomServerLiteral.get().value.value = "next"
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
      }
    },
  })

  steps.push({
    name: "convert useRouterQuery to useRouter",
    action: async () => {
      //First check ./pages
      const pagesDir = path.resolve("pages")
      getAllFiles(pagesDir, [], [], [".ts", ".tsx", ".js", ".jsx"]).forEach((file) => {
        const filepath = path.resolve(pagesDir, file)
        const program = getCollectionFromSource(filepath)

        const parsedProgram = program.get()

        const findRouterQueryImport = findImport(program, "next/router")
        findRouterQueryImport?.forEach((node) => {
          const getNode = node.get()
          getNode.value.specifiers.slice().forEach((specifier: any, index: number) => {
            const importedName =
              specifier.imported.type === "StringLiteral"
                ? specifier.imported.value
                : specifier.imported.name
            if (importedName === "useRouterQuery") {
              addNamedImport(program, "useRouter", "next/router")
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

      getAllFiles(appDir, [], [], [".ts", ".tsx", ".js", ".jsx"]).forEach((file) => {
        const filepath = path.resolve(appDir, file)
        const program = getCollectionFromSource(filepath)

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

  steps.push({
    name: "wrap App component with withBlitz HOC",
    action: async () => {
      const pagesDir = path.resolve("pages")

      const program = getCollectionFromSource(
        path.join(pagesDir, `_app.${isTypescript ? "tsx" : "jsx"}`),
      )
      const appFunction = program.find(j.FunctionDeclaration, (node) => {
        return node.id.name === "App"
      })

      const appIdentifier = program.find(j.Identifier, (node) => {
        return node.name === "App"
      })

      if (appFunction.length) {
        // Store the App function
        const storeFunction = {...appFunction.get().value}
        // Create a new withBlitz call expresion with an empty argument
        const withBlitzFunction = (appFunction.get().parentPath.value.declaration =
          j.expressionStatement(j.callExpression(j.identifier("withBlitz"), []))) as any
        // Push stored function above into the argument
        withBlitzFunction.expression.arguments.push(storeFunction)
      } else if (appIdentifier.length) {
        appIdentifier.forEach((a) => {
          switch (a.name) {
            case "declaration":
              const storeFunction = {...a.get().value}
              // Create a new withBlitz call expresion with an empty argument
              const withBlitzFunction = (a.get().parentPath.value.declaration =
                j.expressionStatement(j.callExpression(j.identifier("withBlitz"), []))) as any
              // Push stored function above into the argument
              withBlitzFunction.expression.arguments.push(storeFunction)
              break
          }
        })
      } else {
        log.error("App function not found")
      }

      addNamedImport(program, "withBlitz", "app/blitz-client")

      fs.writeFileSync(
        path.join(pagesDir, `_app.${isTypescript ? "tsx" : "jsx"}`),
        program.toSource(),
      )
    },
  })

  steps.push({
    name: "update imports in the _document file",
    action: async () => {
      const pagesDir = path.resolve("pages")

      if (fs.existsSync(path.join(pagesDir, `_document.${isTypescript ? "tsx" : "jsx"}`))) {
        const program = getCollectionFromSource(
          path.join(pagesDir, `_document.${isTypescript ? "tsx" : "jsx"}`),
        )

        const importStatements = findImport(program, "next/document")
        importStatements?.remove()
        program
          .get()
          .value.program.body.unshift(
            j.importDeclaration(
              [
                j.importDefaultSpecifier(j.identifier("Document")),
                j.importSpecifier(j.identifier("Html")),
                j.importSpecifier(j.identifier("Head")),
                j.importSpecifier(j.identifier("Main")),
                j.importSpecifier(j.identifier("NextScript")),
              ],
              j.stringLiteral("next/document"),
            ),
          )

        const documentHead = program
          .find(j.Identifier, (node) => node.name === "DocumentHead")
          .get()
        documentHead.value.name = "Head"

        const blitzScript = program.find(j.Identifier, (node) => node.name === "BlitzScript").get()
        blitzScript.value.name = "NextScript"

        fs.writeFileSync(
          path.join(pagesDir, `_document.${isTypescript ? "tsx" : "jsx"}`),
          program.toSource(),
        )
      }
    },
  })

  steps.push({
    name: "wrap getServerSideProps, getStaticProps and API handlers with gSSP, gSP, and api",
    action: async () => {
      const pagesDir = path.resolve("pages")
      getAllFiles(pagesDir, [], ["api"], [".ts", ".tsx", ".js", ".jsx"]).forEach((file) => {
        const program = getCollectionFromSource(file)

        // 1. getServerSideProps
        const getServerSidePropsPath = findFunction(program, "getServerSideProps")
        if (getServerSidePropsPath) {
          getServerSidePropsPath.forEach((path) =>
            wrapDeclaration(path, "getServerSideProps", "gSSP"),
          )
          addNamedImport(program, "gSSP", "app/blitz-server")
        }

        // 2. getStaticProps
        const getStaticPropsPath = findFunction(program, "getStaticProps")
        if (getStaticPropsPath) {
          getStaticPropsPath.forEach((path) => wrapDeclaration(path, "getStaticProps", "gSP"))
          addNamedImport(program, "gSP", "app/blitz-server")
        }

        fs.writeFileSync(path.join(path.resolve(file)), program.toSource())
      })

      // 3. api
      if (fs.existsSync(path.join(pagesDir, "api"))) {
        getAllFiles(
          path.join(pagesDir, "api"),
          [],
          ["rpc"],
          [".ts", ".tsx", ".js", ".jsx"],
        ).forEach((file) => {
          const program = getCollectionFromSource(file)

          const defaultExportPath = findDefaultExportPath(program)
          if (!defaultExportPath) {
            return
          }

          const {node} = defaultExportPath
          node.declaration = j.callExpression(j.identifier("api"), [node.declaration as any])
          addNamedImport(program, "api", "app/blitz-server")

          fs.writeFileSync(path.join(path.resolve(file)), program.toSource())
        })
      }
    },
  })

  steps.push({
    name: "check for usages of a local middleware in resolvers files",
    action: async () => {
      let errors = 0

      getAllFiles(appDir, [], ["components"], [".ts", ".tsx", ".js", ".jsx"]).forEach((file) => {
        const program = getCollectionFromSource(file)
        const middlewarePath = findVariable(program, "middleware")
        if (middlewarePath?.length) {
          console.error(`Local middleware found at ${file}`)
          errors++
        }
      })

      if (errors > 0) {
        throw new Error("Local middleware is not supported")
      }
    },
  })

  steps.push({
    name: "update root types file",
    action: async () => {
      const typeFile = path.join(process.cwd(), "types.ts")

      if (fs.existsSync(typeFile)) {
        const program = getCollectionFromSource(typeFile)

        const findDefaultCtx = () => {
          return program.find(j.Identifier, (node) => node)
        }

        findDefaultCtx().forEach((path) => {
          if (path.value.name === "Ctx") {
            path.parentPath.parentPath.value.declaration.extends = []
          }
          if (path.value.name === "DefaultCtx" && path.name === "imported") {
            j(path.parentPath).remove()
          }
        })

        const findBlitzLiteral = () => {
          return program.find(j.StringLiteral, (node) => node.value === "blitz")
        }

        findBlitzLiteral()
          .paths()
          .forEach((path) => {
            path.value.value = "@blitzjs/auth"
          })

        fs.writeFileSync(typeFile, program.toSource())
      } else {
        log.error("There is no type file")
      }
    },
  })

  steps.push({
    name: "check for usages of invokeWithMiddleware",
    action: async () => {
      let errors = 0

      getAllFiles(appDir, [], [], [".ts", ".tsx", ".js", ".jsx"]).forEach((file) => {
        const program = getCollectionFromSource(file)
        const invokeWithMiddlewarePath = findCallExpression(program, "invokeWithMiddleware")
        if (invokeWithMiddlewarePath?.length) {
          log.error(`\n invokeWithMiddleware found at ${file}. \n`)
          errors++
        }
      })

      getAllFiles(path.resolve("pages"), [], [], [".ts", ".tsx", ".js", ".jsx"]).forEach((file) => {
        const program = getCollectionFromSource(file)
        const invokeWithMiddlewarePath = findCallExpression(program, "invokeWithMiddleware")
        if (invokeWithMiddlewarePath?.length) {
          log.error(`\n invokeWithMiddleware found at ${file}. \n`)
          errors++
        }
      })

      if (errors > 0) {
        throw new Error(
          "\n invokeWithMiddleware is not supported. \n Use invokeWithCtx instead: https://canary.blitzjs.com/docs/resolver-server-utilities#invoke-with-ctx \n Fix the files above, then run the codemod again.",
        )
      }
    },
  })

  // steps.push({
  //   name: "Update invokeMiddleware to invoke",
  //   action: async () => {
  //     getAllFiles(appDir, [], [], [".css"]).forEach((file) => {
  //       const program = getCollectionFromSource(file)
  //       const importSpecifier = findImportSpecifier(program, "invokeWithMiddleware")
  //       importSpecifier?.paths().forEach((path) => {
  //         path.get().value.imported.name = "invoke"
  //       })

  //       const invokeWithMiddlewarePath = findCallExpression(program, "invokeWithMiddleware")
  //       if (invokeWithMiddlewarePath?.length) {
  //         invokeWithMiddlewarePath?.paths().forEach((path) => {
  //           path.get().value.callee.name = "invoke"
  //           if (path.get().value.arguments.length === 3) {
  //             delete path.get().value.arguments[2]
  //           }
  //         })
  //       }

  //       fs.writeFileSync(path.resolve(file), program.toSource())
  //     })

  //     getAllFiles(path.resolve("pages"), [], [], [".css"]).forEach((file) => {
  //       const program = getCollectionFromSource(file)
  //       const importSpecifier = findImportSpecifier(program, "invokeWithMiddleware")
  //       importSpecifier?.paths().forEach((path) => {
  //         path.get().value.imported.name = "invoke"
  //       })

  //       const invokeWithMiddlewarePath = findCallExpression(program, "invokeWithMiddleware")
  //       if (invokeWithMiddlewarePath?.length) {
  //         invokeWithMiddlewarePath?.paths().forEach((path) => {
  //           path.get().value.callee.name = "invoke"
  //           if (path.get().value.arguments.length === 3) {
  //             delete path.get().value.arguments[2]
  //           }
  //         })
  //       }

  //       fs.writeFileSync(path.resolve(file), program.toSource())
  //     })
  //   },
  // })

  // Loop through steps and run the action
  if ((failedAt && failedAt < steps.length) || failedAt !== "SUCCESS" || isLegacyBlitz) {
    for (let [index, step] of steps.entries()) {
      // Ignore previous steps and continue at step that was failed
      if (failedAt && index + 1 < failedAt) {
        continue
      }
      const spinner = log.spinner(log.withBrand(`Running ${step.name}...`)).start()
      try {
        await step.action()
      } catch (err) {
        spinner.fail(`${step.name}`)
        log.error(err as string)
        failedAt = index + 1
        fs.writeJsonSync(".migration.json", {
          failedAt,
        })
        process.exit(1)
      }

      spinner.succeed(`Successfully ran ${step.name}`)
    }

    fs.writeJsonSync(".migration.json", {
      failedAt: "SUCCESS",
    })
  } else {
    if (failedAt === "SUCCESS") {
      log.withBrand("Migration already successful")
      process.exit(0)
    }
    log.error("Legacy blitz config file not found")
  }
}

export {upgradeLegacy}
