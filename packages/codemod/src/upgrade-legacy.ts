import j, {
  Expression,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportSpecifier,
} from "jscodeshift"
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
  removeImport,
  replaceImport,
  replaceIdentifiers,
  replaceBlitzPkgsVersions,
} from "./utils"
import { log } from "blitz"

const CURRENT_BLITZ_TAG = "latest"

class ExpectedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "Expected Error"
  }
}

const isInternalBlitzMonorepoDevelopment = fs.existsSync(
  path.join(__dirname, "../../../blitz-next"),
)
type Step = { name: string; action: (stepIndex: number) => Promise<void> }
const upgradeLegacy = async () => {
  let isTypescript = fs.existsSync(path.resolve("tsconfig.json"))
  let blitzConfigFile = `blitz.config.${isTypescript ? "ts" : "js"}`
  let isLegacyBlitz = fs.existsSync(path.resolve(blitzConfigFile))
  const appDir = path.resolve("app")
  let failedAt =
    fs.existsSync(path.resolve(".migration.json")) && fs.readJSONSync("./.migration.json").failedAt
  let collectedErrors: { message: string; step: number }[] = []
  let steps: Step[] = []

  // Add steps in order

  steps.push({
    name: "move the config from blitz.config.ts to next.config.js",
    action: async () => {
      const program = getCollectionFromSource(blitzConfigFile)
      const parsedProgram = program.get()

      // Remove BlitzConfig type annotation
      let findBlitzConfigType = program.find(j.Identifier, (node) => node.name === "BlitzConfig")
      if (findBlitzConfigType) {
        findBlitzConfigType.forEach((c) => {
          if (c.name === "typeName") {
            j(c.parentPath.parentPath).remove()
          }

          if (c.name === "imported") {
            j(c.parentPath).remove()
          }
        })
      }

      // Remove all typescript stuff
      let findTypes = program.find(j.TSType, (node) => node)
      if (findTypes.length) {
        findTypes.forEach((t) => {
          if (t.name === "typeAnnotation") {
            j(t.parentPath).remove()
          }
        })
      }

      let withBlitz = j.objectProperty(j.identifier("withBlitz"), j.identifier("withBlitz"))
      withBlitz.shorthand = true
      let config = program.find(j.AssignmentExpression, {
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
      let createdConfig = config.get().value.right
      let importWithBlitz = j.expressionStatement(
        j.assignmentExpression(
          "=",
          j.identifier("const { withBlitz }"),
          j.callExpression(j.identifier("require"), [j.identifier(`"@blitzjs/next"`)]),
        ),
      )
      parsedProgram.value.program.body.unshift(importWithBlitz)
      config.remove()

      const findImports = program.find(j.ImportDeclaration, (node) => node)
      if (findImports.length) {
        findImports.forEach((i) => {
          const defaultImport = i.value.specifiers?.find((s) => s.type === "ImportDefaultSpecifier")
          const namedImports = i.value.specifiers?.filter((s) => s.type === "ImportSpecifier")
          let flag = false
          if (defaultImport && defaultImport.local) {
            const importStatement = j.expressionStatement(
              j.assignmentExpression(
                "=",
                j.identifier("const " + defaultImport.local.name),
                j.callExpression(j.identifier("require"), [j.stringLiteral(`${i.value.source.value}`)]),
              ),
            )
            parsedProgram.value.program.body.unshift(importStatement)
            flag = true
          }
          if (namedImports && namedImports.length) {
            const namedImportNames = namedImports.map((s) => s.local?.name)
            const namedImportNamesString = namedImportNames.join(", ")
            const importStatement = j.expressionStatement(
              j.assignmentExpression(
                "=",
                j.identifier("const {" + namedImportNamesString + "}"),
                j.callExpression(j.identifier("require"), [j.stringLiteral(`${i.value.source.value}`)]),
              ),
            )
            parsedProgram.value.program.body.unshift(importStatement)
            flag = true
          }
          if (flag) {
            j(i).remove()
          }
        })
      }

      let moduleExportStatement = j.expressionStatement(
        j.assignmentExpression(
          "=",
          j.memberExpression(j.identifier("module"), j.identifier("exports")),
          j.callExpression(j.identifier("withBlitz"), [createdConfig]),
        ),
      )
      parsedProgram.value.program.body.push(moduleExportStatement)

      fs.writeFileSync(path.resolve("next.config.js"), program.toSource())
    },
  })

  steps.push({
    name: "update .eslintrc.js configuration",
    action: async (stepIndex) => {
      if (fs.existsSync(path.resolve(".eslintrc.js"))) {
        const program = getCollectionFromSource(".eslintrc.js")
        const parsedProgram = program.get()
        parsedProgram.value.program.body = []
        const moduleExport = j.expressionStatement(
          j.assignmentExpression(
            "=",
            j.memberExpression(j.identifier("module"), j.identifier("exports")),
            j.callExpression(j.identifier("require"), [j.identifier(`"@blitzjs/next/eslint"`)]),
          ),
        )
        parsedProgram.value.program.body.push(moduleExport)
        fs.writeFileSync(path.resolve(".eslintrc.js"), program.toSource())
      } else {
        collectedErrors.push({
          message: ".eslintrc.js does not exist",
          step: stepIndex,
        })
      }
    },
  })

  steps.push({
    name: "update dependencies in package.json",
    action: async () => {
      const packageJson = require(path.resolve("package.json"))

      const newPackageJson = await replaceBlitzPkgsVersions(packageJson, CURRENT_BLITZ_TAG)

      fs.writeFileSync(path.resolve("package.json"), JSON.stringify(newPackageJson, null, " "))
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
        DocumentProps: "next/document",
        DocumentContext: "next/document",
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
        AuthenticatedMiddlewareCtx: "@blitzjs/rpc",
        getAntiCSRFToken: "@blitzjs/auth",
        useSession: "@blitzjs/auth",
        useAuthenticatedSession: "@blitzjs/auth",
        useRedirectAuthenticated: "@blitzjs/auth",
        AuthenticatedSessionContext: "@blitzjs/auth",
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

      const renames: Record<string, string> = {
        ErrorComponent: "DefaultErrorComponent",
      }

      getAllFiles(appDir, [], [], [".ts", ".tsx", ".js", ".jsx"]).forEach((filename) => {
        try {
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
                    addNamedImport(
                      program,
                      importedName,
                      specialImports[importedName]!,
                      undefined,
                      renames[importedName],
                    )
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
        } catch (e) {
          log.error(`Error updating imports in the ${file}`)
          throw new Error(e)
        }
      })
    },
  })

  steps.push({
    name: "update NextJS' default imports",
    action: async () => {
      getAllFiles(appDir, [], [], [".ts", ".tsx", ".js", ".jsx"]).forEach((file) => {
        try {
          const program = getCollectionFromSource(file)

          const nextImage = findImport(program, "next/image")
          const nextLink = findImport(program, "next/link")
          const nextHead = findImport(program, "next/head")
          const dynamic = findImport(program, "next/dynamic")
          const nextScript = findImport(program, "next/script")

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

          if (nextScript?.length) {
            nextScript.remove()
            program
              .get()
              .value.program.body.unshift(
                j.importDeclaration(
                  [j.importDefaultSpecifier(j.identifier("Script"))],
                  j.stringLiteral("next/script"),
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

          if (dynamic?.length) {
            dynamic.remove()
            program
              .get()
              .value.program.body.unshift(
                j.importDeclaration(
                  [j.importDefaultSpecifier(j.identifier("dynamic"))],
                  j.stringLiteral("next/dynamic"),
                ),
              )
          }

          fs.writeFileSync(path.join(path.resolve(file)), program.toSource())
        } catch (e) {
          log.error(`Error in updating next.js default imports in the ${file}`)
          throw new Error(e)
        }
      })
    },
  })

  steps.push({
    name: "change queryClient to getQueryClient()",
    action: async () => {
      getAllFiles(appDir, [], [], [".ts", ".tsx", ".js", ".jsx"]).forEach((file) => {
        try {
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
        } catch (e) {
          log.error(`Error in changing queryClient to getQueryClient in the ${file}`)
          throw new Error(e)
        }
      })
    },
  })

  steps.push({
    name: "change BlitzApiRequest to NextApiRequest",
    action: async () => {
      getAllFiles(path.join(appDir, "api"), [], [], [".ts", ".tsx", ".js", ".jsx"]).forEach(
        (file) => {
          try {
            const program = getCollectionFromSource(file)

            replaceImport(program, "blitz", "BlitzApiRequest", "next", "NextApiRequest")
            replaceIdentifiers(program, "BlitzApiRequest", "NextApiRequest")

            fs.writeFileSync(path.join(path.resolve(file)), program.toSource())
          } catch (e) {
            log.error(`Error in changing BlitzApiRequest to NextApiRequest in the ${file}`)
            throw new Error(e)
          }
        },
      )
    },
  })

  steps.push({
    name: "change BlitzApiResponse to NextApiResponse",
    action: async () => {
      getAllFiles(path.join(appDir, "api"), [], [], [".ts", ".tsx", ".js", ".jsx"]).forEach(
        (file) => {
          try {
            const program = getCollectionFromSource(file)

            replaceImport(program, "blitz", "BlitzApiResponse", "next", "NextApiResponse")
            replaceIdentifiers(program, "BlitzApiResponse", "NextApiResponse")

            fs.writeFileSync(path.join(path.resolve(file)), program.toSource())
          } catch (e) {
            log.error(`Error in changing BlitzApiResponse to NextApiResponse in the ${file}`)
            throw new Error(e)
          }
        },
      )
    },
  })

  steps.push({
    name: "change BlitzApiHandler to NextApiHandler",
    action: async () => {
      getAllFiles(path.join(appDir, "api"), [], [], [".ts", ".tsx", ".js", ".jsx"]).forEach(
        (file) => {
          try {
            const program = getCollectionFromSource(file)

            replaceImport(program, "blitz", "BlitzApiHandler", "next", "NextApiHandler")
            replaceIdentifiers(program, "BlitzApiHandler", "NextApiHandler")

            fs.writeFileSync(path.join(path.resolve(file)), program.toSource())
          } catch (e) {
            log.error(`Error in changing BlitzApiHandler to NextApiHandler in the ${file}`)
            throw new Error(e)
          }
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
        throw new ExpectedError("App directory doesn't exit")
      }
    },
  })

  steps.push({
    name: "Add cookiePrefix to blitz server",
    action: async (stepIndex) => {
      const blitzConfigProgram = getCollectionFromSource(blitzConfigFile)
      const cookieIdentifier = blitzConfigProgram.find(
        j.Identifier,
        (node) => node.name === "cookiePrefix",
      )
      if (cookieIdentifier.length) {
        const cookiePrefix = cookieIdentifier.get().parentPath.value.value.value
        if (cookiePrefix) {
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
          // Show error at end of codemod
          collectedErrors.push({
            message:
              "Detected cookiePrefix is undefined. Please set your cookie prefix manually in app/blitz-client",
            step: stepIndex,
          })
        }
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
          ...middlewares.map((m: Node) => j.template.expression`BlitzServerMiddleware(${m})`),
        ]

        let importStatements = []
        for (let nodes of blitzConfigProgram.get().value.program.body) {
          if (nodes.type === "ImportDeclaration") {
            // Find duplicates
            const dup = blitzServerProgram.find(
              j.ImportDeclaration,
              (node) => node.source.value === nodes.source.value,
            )
            if (nodes.source.value !== "blitz" && !dup.length) {
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

        importStatements.forEach((s) => blitzServerProgram.get().value.program.body.unshift(s))
        addNamedImport(blitzServerProgram, "BlitzServerMiddleware", "blitz")

        fs.writeFileSync(
          `${appDir}/blitz-server.${isTypescript ? "ts" : "js"}`,
          blitzServerProgram.toSource(),
        )

        // Remove middleware array from next.config.js
        const nextConfigProgram = getCollectionFromSource(path.resolve("next.config.js"))
        const nextConfigMiddlewareArray = nextConfigProgram.find(
          j.Identifier,
          (node) => node.name === "middleware",
        )
        j(nextConfigMiddlewareArray.get().parentPath).remove()
        fs.writeFileSync(`next.config.js`, nextConfigProgram.toSource())
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
        fs.mkdirSync(pagesDir, { recursive: true })
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
          (arr: { model: string; path: string; subModel?: string }[], file: string) => {
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
                      model: "",
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
              `Failed to find "blitz/custom-server" import in ${customServerDir}/index.${isTypescript ? "ts" : "js"
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
        try {
          const filepath = path.resolve(pagesDir, file)
          const program = getCollectionFromSource(filepath)

          const parsedProgram = program.get()

          const findRouterQueryImport = findImport(program, "next/router")

          if (findRouterQueryImport?.length) {
            findRouterQueryImport?.forEach((node) => {
              const getNode = node.get()
              getNode.value.specifiers.slice().forEach((specifier: any, index: number) => {
                const importedName = (): string | null => {
                  if (specifier.imported) {
                    if (specifier.imported.type === "StringLiteral") {
                      return specifier.imported.value
                    } else if (specifier.imported.type === "Identifier") {
                      return specifier.imported.name
                    }
                  }
                  return null
                }

                if (importedName() && importedName() === "useRouterQuery") {
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
          }
        } catch (e) {
          log.error(`Error in changing useRouterQuery to useRouter in the ${file}`)
          throw new Error(e)
        }
      })

      getAllFiles(appDir, [], [], [".ts", ".tsx", ".js", ".jsx"]).forEach((file) => {
        try {
          const filepath = path.resolve(appDir, file)
          const program = getCollectionFromSource(filepath)

          const parsedProgram = program.get()
          const findRouterQueryImport = program.find(
            j.ImportDeclaration,
            (node) => node.source.value === "next/router",
          )
          if (findRouterQueryImport?.length) {
            findRouterQueryImport.forEach((node) => {
              const getNode = node.get()
              getNode.value.specifiers.slice().forEach((specifier: any, index: number) => {
                const importedName = (): string | null => {
                  if (specifier.imported) {
                    if (specifier.imported.type === "StringLiteral") {
                      return specifier.imported.value
                    } else if (specifier.imported.type === "Identifier") {
                      return specifier.imported.name
                    }
                  }
                  return null
                }

                if (importedName() && importedName() === "useRouterQuery") {
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
          }
        } catch (e) {
          log.error(`Error in changing useRouterQuery to useRouter in the ${file}`)
          throw new Error(e)
        }
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
        const storeFunction = { ...appFunction.get().value }
        // Create a new withBlitz call expresion with an empty argument
        const withBlitzFunction = (appFunction.get().parentPath.value.declaration =
          j.expressionStatement(j.callExpression(j.identifier("withBlitz"), []))) as any
        // Push stored function above into the argument
        withBlitzFunction.expression.arguments.push(storeFunction)
      } else if (appIdentifier.length) {
        appIdentifier.forEach((a) => {
          switch (a.name) {
            case "declaration":
              const storeFunction = { ...a.get().value }
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

        let nextDocumentImportPaths: (ImportSpecifier | ImportDefaultSpecifier)[] = []
        importStatements?.forEach((path) => {
          path.value.specifiers?.forEach((s) => {
            if (s.type === "ImportSpecifier") {
              // Go through the typical imports required for Next.js and build the correct import specifier
              switch (s.imported.name) {
                case "Document":
                  nextDocumentImportPaths.unshift(
                    j.importDefaultSpecifier(j.identifier("Document")),
                  )
                  break
                case "BlitzScript":
                  nextDocumentImportPaths.push(j.importSpecifier(j.identifier("NextScript")))
                  break
                case "Html":
                  nextDocumentImportPaths.push(j.importSpecifier(j.identifier("Html")))
                  break
                case "Main":
                  nextDocumentImportPaths.push(j.importSpecifier(j.identifier("Main")))
                  break
                case "DocumentHead":
                  nextDocumentImportPaths.push(j.importSpecifier(j.identifier("Head")))
                  break
                case "DocumentProps":
                  nextDocumentImportPaths.push(j.importSpecifier(j.identifier("DocumentProps")))
                  break
                case "DocumentContext":
                  nextDocumentImportPaths.push(j.importSpecifier(j.identifier("DocumentContext")))
                  break
              }
            }
          })
        })

        // Add new import statement to the top of the _document page
        program
          .get()
          .value.program.body.unshift(
            j.importDeclaration([...nextDocumentImportPaths], j.stringLiteral("next/document")),
          )
        // Remove the old import statements
        importStatements?.remove()

        const document = program.find(
          j.JSXElement,
          (node) => node.openingElement.name.name === "DocumentHead",
        )

        if (document.length) {
          const documentHead = document.get()
          documentHead.value.openingElement.name.name = "Head"
          if (documentHead.value.closingElement) {
            documentHead.value.closingElement.name.name = "Head"
          }
          const blitzScript = program
            .find(j.Identifier, (node) => node.name === "BlitzScript")
            .get()
          blitzScript.value.name = "NextScript"
        }

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
        try {
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
        } catch (e) {
          log.error(`Error in wrapping getServerSideProps, getStaticProps in the ${file}`)
          throw new Error(e)
        }
      })

      // 3. api
      if (fs.existsSync(path.join(pagesDir, "api"))) {
        getAllFiles(
          path.join(pagesDir, "api"),
          [],
          ["rpc"],
          [".ts", ".tsx", ".js", ".jsx"],
        ).forEach((file) => {
          try {
            const program = getCollectionFromSource(file)
            const defaultExportPath = findDefaultExportPath(program)
            if (defaultExportPath) {
              const { node } = defaultExportPath

              if (node.declaration.type === "Identifier") {
                node.declaration = j.callExpression(j.identifier("api"), [node.declaration as any])
                addNamedImport(program, "api", "app/blitz-server")
              } else if (node.declaration.type === "FunctionDeclaration") {
                node.declaration = j.template.expression`api(${node.declaration})`
                addNamedImport(program, "api", "app/blitz-server")
              }

              fs.writeFileSync(path.join(path.resolve(file)), program.toSource())
            }
          } catch (e) {
            log.error(`Error in wrapping api in the ${file}`)
            throw new Error(e)
          }
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
        throw new ExpectedError("Local middleware is not supported")
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
      getAllFiles(path.resolve("pages"), [], [], [".ts", ".tsx", ".js", ".jsx"]).forEach((file) => {
        const program = getCollectionFromSource(file)
        try {
          const invokeWithMiddlewarePath = findCallExpression(program, "invokeWithMiddleware")
          if (invokeWithMiddlewarePath?.length) {
            invokeWithMiddlewarePath.forEach((path) => {
             const resolverName = path.value.arguments.at(0)
             if(resolverName?.type === "Identifier") {
              const resolverExpression = j.callExpression(
                j.identifier(resolverName.name),
                path.value.arguments.slice(1),
              )
              const resolverStatement = j.expressionStatement(resolverExpression)
              j(path).replaceWith(resolverStatement)
             }
             else{
              throw new Error(`invokeWithMiddleware can only be used with a resolver as the first argument \nError at Line ${path?.value?.loc?.start.line}`)
             }
            })              
          }
        } catch (e:any) {
          log.error(`\nError in checking invokeWithMiddleware in ${file}`)
          throw new Error(e)
        }
        fs.writeFileSync(path.join(path.resolve(file)), program.toSource())
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
        const error = err as { code: string } | string
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
    log.error("Legacy blitz config file not found")
  }
}

export { upgradeLegacy }
