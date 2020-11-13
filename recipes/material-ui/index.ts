import {addImport, paths, RecipeBuilder} from "@blitzjs/installer"
import j from "jscodeshift"
import {Collection} from "jscodeshift/src/Collection"

export default RecipeBuilder()
  .setName("Material-UI")
  .setDescription(
    `Configure your Blitz app's styling with Material-UI. This recipe will install all necessary dependencies and configure a base Material-UI setup for immediate usage.
    
NOTE: Material-UI currently doesn't support concurrent mode. For the most part you can use @material-ui components without altering anything. But, you may face issues if you intend to use dynamic styling features like the Box component that wraps all the style functions provided as a component or pass props to the hooks created by the makeStyles utility to alter stylings during runtime. If you face any such issues, you can always opt out of the concurrent mode by adding the following to the blitz.config.js - 
    
module.exports = {    
  experimental: {
    reactNode: "legacy"
  },

  // keep the other parts of the config as is
},

This will let the next.js app opt out of the React.Strict mode wrapping. Once you switch to legacy mode, you will also have to pass { suspense: false } to the useQuery options when querying data endpoints in your pages/components. You can check the documentation for useQuery at https://blitzjs.com/docs/use-query#options`,
  )
  .setOwner("s.pathak5995@gmail.com")
  .setRepoLink("https://github.com/blitz-js/blitz")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "Add npm dependencies",
    explanation: `@material-ui/core needs to be installed`,
    packages: [{name: "@material-ui/core", version: "latest"}],
  })
  .addTransformFilesStep({
    stepId: "modifyGetInitialPropsInCustomDocumentApp",
    stepName: "Add custom getInitialProps logic in Custom Document",
    explanation: `We will add custom getInitialProps logic in _document. We need to do this so that styles are correctly rendered on the server side.`,
    singleFileSearch: paths.document(),
    transform(program: Collection<j.Program>) {
      // import ServerStyleSheets
      const serverStyleSheetsImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("ServerStyleSheets"))],
        j.literal("@material-ui/core/styles"),
      )

      let isReactImported = false

      program.find(j.ImportDeclaration, {source: "react"}).forEach((reactImportPath) => {
        isReactImported = true
        if (reactImportPath.value.specifiers.some((spec) => j.ImportDefaultSpecifier.check(spec))) {
          reactImportPath.value.specifiers.splice(
            0,
            0,
            j.importDefaultSpecifier(j.identifier("React")),
          )
        }
      })
      program.find(j.ImportDeclaration, {source: {value: "blitz"}}).forEach((blitzImportPath) => {
        if (
          !blitzImportPath.value.specifiers
            .filter((spec) => j.ImportSpecifier.check(spec))
            .some((node) => (node as j.ImportSpecifier)?.imported?.name === "DocumentContext")
        ) {
          blitzImportPath.value.specifiers.splice(
            0,
            0,
            j.importSpecifier(j.identifier("DocumentContext")),
          )
        }
      })
      program.find(j.ClassBody).forEach((path) => {
        const {node} = path

        const ctxParam = j.identifier("ctx")
        ctxParam.typeAnnotation = j.tsTypeAnnotation(
          j.tsTypeReference(j.identifier("DocumentContext")),
        )

        const getInitialPropsBody = j.blockStatement([
          j.variableDeclaration("const", [
            j.variableDeclarator(
              j.identifier("sheets"),
              j.newExpression(j.identifier("ServerStyleSheets"), []),
            ),
          ]),
          j.variableDeclaration("const", [
            j.variableDeclarator(
              j.identifier("originalRenderPage"),
              j.memberExpression(j.identifier("ctx"), j.identifier("renderPage")),
            ),
          ]),
          j.expressionStatement(
            j.assignmentExpression(
              "=",
              j.memberExpression(j.identifier("ctx"), j.identifier("renderPage")),
              j.arrowFunctionExpression(
                [],
                j.callExpression(j.identifier("originalRenderPage"), [
                  j.objectExpression([
                    j.objectProperty(
                      j.identifier("enhanceApp"),
                      j.arrowFunctionExpression(
                        [j.identifier("App")],
                        j.arrowFunctionExpression(
                          [j.identifier("props")],
                          j.callExpression(
                            j.memberExpression(j.identifier("sheets"), j.identifier("collect")),
                            [
                              j.jsxElement(
                                j.jsxOpeningElement(
                                  j.jsxIdentifier("App"),
                                  [j.jsxSpreadAttribute(j.identifier("props"))],
                                  true,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ]),
                ]),
              ),
            ),
          ),
          j.variableDeclaration("const", [
            j.variableDeclarator(
              j.identifier("initialProps"),
              j.awaitExpression(
                j.callExpression(
                  j.memberExpression(j.identifier("Document"), j.identifier("getInitialProps")),
                  [j.identifier("ctx")],
                ),
              ),
            ),
          ]),
          j.returnStatement(
            j.objectExpression([
              j.spreadElement(j.identifier("initialProps")),
              j.objectProperty(
                j.identifier("styles"),
                j.arrayExpression([
                  j.spreadElement(
                    j.callExpression(
                      j.memberExpression(
                        j.memberExpression(j.identifier("React"), j.identifier("Children")),
                        j.identifier("toArray"),
                      ),
                      [j.memberExpression(j.identifier("initialProps"), j.identifier("styles"))],
                    ),
                  ),
                  j.callExpression(
                    j.memberExpression(j.identifier("sheets"), j.identifier("getStyleElement")),
                    [],
                  ),
                ]),
              ),
            ]),
          ),
        ])

        const getInitialPropsMethod = j.classMethod(
          "method",
          j.identifier("getInitialProps"),
          [ctxParam],
          getInitialPropsBody,
          false,
          true,
        )
        getInitialPropsMethod.async = true

        // TODO: better way will be to check if the method already exists and modify it or else add it
        // currently it gets added assuming it did not exist before
        node.body.splice(0, 0, getInitialPropsMethod)
      })

      // import React if it wasn't already imported
      if (!isReactImported) {
        const reactImport = j.importDeclaration(
          [j.importDefaultSpecifier(j.identifier("React"))],
          j.literal("react"),
        )
        addImport(program, reactImport)
      }

      addImport(program, serverStyleSheetsImport)

      return program
    },
  })
  .addTransformFilesStep({
    stepId: "importThemeProviderInCustomApp",
    stepName: "Customize App and import ThemeProvider with a base theme and CssBaseline component",
    explanation: `We will import the ThemeProvider into _app and the CssBaseline component for easy and consistent usage of the @material-ui components. We will also customize the _app component to be remove the server side injected CSS.`,
    singleFileSearch: paths.app(),
    transform(program) {
      // import ThemeProvider and createMuiTheme
      const themeImport = j.importDeclaration(
        [
          j.importSpecifier(j.identifier("ThemeProvider")),
          j.importSpecifier(j.identifier("createMuiTheme")),
        ],
        j.literal("@material-ui/core/styles"),
      )

      // import CSSBaseline
      const cssBaselineImport = j.importDeclaration(
        [j.importDefaultSpecifier(j.identifier("CssBaseline"))],
        j.literal("@material-ui/core/CssBaseline"),
      )

      addImport(program, cssBaselineImport)
      addImport(program, themeImport)

      let isReactImported = false

      program.find(j.ExportDefaultDeclaration).forEach((path) => {
        const theme = j.variableDeclaration("const", [
          j.variableDeclarator(
            j.identifier("theme"),
            j.callExpression(j.identifier("createMuiTheme"), [
              j.objectExpression([
                j.objectProperty(
                  j.identifier("palette"),
                  j.objectExpression([
                    j.objectProperty(j.identifier("type"), j.stringLiteral("light")),
                  ]),
                ),
              ]),
            ]),
          ),
        ])
        theme.comments = [
          j.commentLine(
            "You can customize this as you want and even move it out to a separate file",
          ),
        ]

        path.insertBefore(theme)
      })

      program.find(j.ImportDeclaration, {source: "react"}).forEach((path) => {
        // check if React is already imported
        // if yes then we can skip importing it
        // since we need it for useEffect
        isReactImported = true

        // currently, we only check if the default export is there
        // because we use the hook as React.useEffect
        // if not then add the default export
        if (!path.value.specifiers.some((node) => j.ImportDefaultSpecifier.check(node))) {
          path.value.specifiers.splice(0, 0, j.importDefaultSpecifier(j.identifier("React")))
        }
      })

      program.find(j.Function).forEach((path) => {
        const {parentPath, node} = path

        // assuming App component is the default export of the file
        if (parentPath && j.ExportDefaultDeclaration.check(parentPath)) {
          const removeServerSideInjectedCss = j.expressionStatement(
            j.callExpression(j.memberExpression(j.identifier("React"), j.identifier("useEffect")), [
              j.arrowFunctionExpression(
                [],
                j.blockStatement([
                  j.variableDeclaration("const", [
                    j.variableDeclarator(
                      j.identifier("jssStyles"),
                      j.callExpression(
                        j.memberExpression(j.identifier("document"), j.identifier("querySelector")),
                        [j.literal("#jss-server-side")],
                      ),
                    ),
                  ]),
                  j.ifStatement(
                    j.logicalExpression(
                      "&&",
                      j.identifier("jssStyles"),
                      j.memberExpression(j.identifier("jssStyles"), j.identifier("parentElement")),
                    ),
                    j.blockStatement([
                      j.expressionStatement(
                        j.callExpression(
                          j.memberExpression(
                            j.memberExpression(
                              j.identifier("jssStyles"),
                              j.identifier("parentElement"),
                            ),
                            j.identifier("removeChild"),
                          ),
                          [j.identifier("jssStyles")],
                        ),
                      ),
                    ]),
                  ),
                ]),
              ),
              j.arrayExpression([]),
            ]),
          )

          node.body.body.splice(0, 0, removeServerSideInjectedCss)
        }
      })

      program
        .find(j.JSXElement)
        .filter(
          (path) =>
            path.parent?.parent?.parent?.value?.id?.name === "App" &&
            path.parent?.value.type === j.ReturnStatement.toString(),
        )
        .forEach((path) => {
          const {node} = path
          path.replace(
            j.jsxElement(
              j.jsxOpeningElement(j.jsxIdentifier("ThemeProvider"), [
                j.jsxAttribute(
                  j.jsxIdentifier("theme"),
                  j.jsxExpressionContainer(j.identifier("theme")),
                ),
              ]),
              j.jsxClosingElement(j.jsxIdentifier("ThemeProvider")),
              [
                j.literal("\n"),
                j.jsxElement(j.jsxOpeningElement(j.jsxIdentifier("CssBaseline"), [], true)),
                j.literal("\n"),
                node,
                j.literal("\n"),
              ],
            ),
          )
        })

      // import React if it wasn't already imported
      if (!isReactImported) {
        const reactImport = j.importDeclaration(
          [j.importDefaultSpecifier(j.identifier("React"))],
          j.literal("react"),
        )
        addImport(program, reactImport)
      }

      return program
    },
  })
  .build()
