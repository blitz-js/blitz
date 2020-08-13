import {RecipeBuilder, paths, addImport} from "@blitzjs/installer"
import {builders} from "ast-types/gen/builders"
import {ASTNode} from "ast-types/lib/types"
import {NamedTypes, namedTypes} from "ast-types/gen/namedTypes"
import {visit} from "ast-types"

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
    transform(ast: ASTNode, b: builders, t: NamedTypes) {
      if (t.File.check(ast)) {
        // import ServerStyleSheets
        const serverStyleSheetsImport = b.importDeclaration(
          [b.importSpecifier(b.identifier("ServerStyleSheets"))],
          b.literal("@material-ui/core/styles"),
        )

        let isReactImported = false

        visit(ast, {
          visitImportDeclaration(path) {
            // check if React is already imported
            // if yes then we can skip importing it
            // since we need it for useEffect
            const source = path.value.source.value
            if (source === "react") {
              isReactImported = true

              // currently, we only check if the default export is there
              // because we use the hook as React.useEffect
              // if not then add the default export
              if (
                !path.value.specifiers.some(
                  (node: namedTypes.ImportDefaultSpecifier | namedTypes.ImportSpecifier) =>
                    node.type === "ImportDefaultSpecifier",
                )
              ) {
                path.value.specifiers.splice(0, 0, b.importDefaultSpecifier(b.identifier("React")))

                return false
              }
            }
            // check if DocumentContext is imported from blitz if not add that as well
            else if (source === "blitz") {
              if (
                !path.value.specifiers
                  .filter(
                    (node: namedTypes.ImportDefaultSpecifier | namedTypes.ImportSpecifier) =>
                      node.type === "ImportSpecifier",
                  )
                  .some(
                    (node: namedTypes.ImportSpecifier) =>
                      node?.imported?.name === "DocumentContext",
                  )
              ) {
                path.value.specifiers.splice(
                  0,
                  0,
                  b.importSpecifier(b.identifier("DocumentContext")),
                )
              }
            }

            return this.traverse(path)
          },
          visitClassBody(path) {
            const {node} = path

            const ctxParam = b.identifier("ctx")
            ctxParam.typeAnnotation = b.tsTypeAnnotation(
              b.tsTypeReference(b.identifier("DocumentContext")),
            )

            const getInitialPropsBody = b.blockStatement([
              b.variableDeclaration("const", [
                b.variableDeclarator(
                  b.identifier("sheets"),
                  b.newExpression(b.identifier("ServerStyleSheets"), []),
                ),
              ]),
              b.variableDeclaration("const", [
                b.variableDeclarator(
                  b.identifier("originalRenderPage"),
                  b.memberExpression(b.identifier("ctx"), b.identifier("renderPage")),
                ),
              ]),
              b.expressionStatement(
                b.assignmentExpression(
                  "=",
                  b.memberExpression(b.identifier("ctx"), b.identifier("renderPage")),
                  b.arrowFunctionExpression(
                    [],
                    b.callExpression(b.identifier("originalRenderPage"), [
                      b.objectExpression([
                        b.objectProperty(
                          b.identifier("enhanceApp"),
                          b.arrowFunctionExpression(
                            [b.identifier("App")],
                            b.arrowFunctionExpression(
                              [b.identifier("props")],
                              b.callExpression(
                                b.memberExpression(b.identifier("sheets"), b.identifier("collect")),
                                [
                                  b.jsxElement(
                                    b.jsxOpeningElement(
                                      b.jsxIdentifier("App"),
                                      [b.jsxSpreadAttribute(b.identifier("props"))],
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
              b.variableDeclaration("const", [
                b.variableDeclarator(
                  b.identifier("initialProps"),
                  b.awaitExpression(
                    b.callExpression(
                      b.memberExpression(b.identifier("Document"), b.identifier("getInitialProps")),
                      [b.identifier("ctx")],
                    ),
                  ),
                ),
              ]),
              b.returnStatement(
                b.objectExpression([
                  b.spreadElement(b.identifier("initialProps")),
                  b.objectProperty(
                    b.identifier("styles"),
                    b.arrayExpression([
                      b.spreadElement(
                        b.callExpression(
                          b.memberExpression(
                            b.memberExpression(b.identifier("React"), b.identifier("Children")),
                            b.identifier("toArray"),
                          ),
                          [
                            b.memberExpression(
                              b.identifier("initialProps"),
                              b.identifier("styles"),
                            ),
                          ],
                        ),
                      ),
                      b.callExpression(
                        b.memberExpression(b.identifier("sheets"), b.identifier("getStyleElement")),
                        [],
                      ),
                    ]),
                  ),
                ]),
              ),
            ])

            const getInitialPropsMethod = b.classMethod(
              "method",
              b.identifier("getInitialProps"),
              [ctxParam],
              getInitialPropsBody,
              false,
              true,
            )
            getInitialPropsMethod.async = true

            // TODO: better way will be to check if the method already exists and modify it or else add it
            // currently it gets added assuming it did not exist before
            node.body.splice(0, 0, getInitialPropsMethod)

            return false
          },
        })

        // import React if it wasn't already imported
        if (!isReactImported) {
          const reactImport = b.importDeclaration(
            [b.importDefaultSpecifier(b.identifier("React"))],
            b.literal("react"),
          )
          addImport(ast, b, t, reactImport)
        }

        addImport(ast, b, t, serverStyleSheetsImport)

        return ast
      }

      throw new Error("Not given valid source file")
    },
  })
  .addTransformFilesStep({
    stepId: "importThemeProviderInCustomApp",
    stepName: "Customize App and import ThemeProvider with a base theme and CssBaseline component",
    explanation: `We will import the ThemeProvider into _app and the CssBaseline component for easy and consistent usage of the @material-ui components. We will also customize the _app component to be remove the server side injected CSS.`,
    singleFileSearch: paths.app(),
    transform(ast: ASTNode, b: builders, t: NamedTypes) {
      if (t.File.check(ast)) {
        // import ThemeProvider and createMuiTheme
        const themeImport = b.importDeclaration(
          [
            b.importSpecifier(b.identifier("ThemeProvider")),
            b.importSpecifier(b.identifier("createMuiTheme")),
          ],
          b.literal("@material-ui/core/styles"),
        )

        // import CSSBaseline
        const cssBaselineImport = b.importDeclaration(
          [b.importDefaultSpecifier(b.identifier("CssBaseline"))],
          b.literal("@material-ui/core/CssBaseline"),
        )

        addImport(ast, b, t, cssBaselineImport)
        addImport(ast, b, t, themeImport)

        let isReactImported = false

        visit(ast, {
          visitExportDefaultDeclaration(path) {
            const theme = b.variableDeclaration("const", [
              b.variableDeclarator(
                b.identifier("theme"),
                b.callExpression(b.identifier("createMuiTheme"), [
                  b.objectExpression([
                    b.objectProperty(
                      b.identifier("palette"),
                      b.objectExpression([
                        b.objectProperty(b.identifier("type"), b.stringLiteral("light")),
                      ]),
                    ),
                  ]),
                ]),
              ),
            ])
            theme.comments = [
              b.commentLine(
                "You can customize this as you want and even move it out to a separate file",
              ),
            ]

            path.insertBefore(theme)

            return this.traverse(path)
          },
          visitImportDeclaration(path) {
            // check if React is already imported
            // if yes then we can skip importing it
            // since we need it for useEffect
            const source = path.value.source.value
            if (source === "react") {
              isReactImported = true

              // currently, we only check if the default export is there
              // because we use the hook as React.useEffect
              // if not then add the default export
              if (
                !path.value.specifiers.some(
                  (node: namedTypes.ImportSpecifier | namedTypes.ImportDefaultSpecifier) =>
                    node.type === "ImportDefaultSpecifier",
                )
              ) {
                path.value.specifiers.splice(0, 0, b.importDefaultSpecifier(b.identifier("React")))
              }
            }

            return this.traverse(path)
          },
          visitFunction(path) {
            const {parentPath, node} = path

            // assuming App component is the default export of the file
            if (parentPath && parentPath.value.type === "ExportDefaultDeclaration") {
              const removeServerSideInjectedCss = b.expressionStatement(
                b.callExpression(
                  b.memberExpression(b.identifier("React"), b.identifier("useEffect")),
                  [
                    b.arrowFunctionExpression(
                      [],
                      b.blockStatement([
                        b.variableDeclaration("const", [
                          b.variableDeclarator(
                            b.identifier("jssStyles"),
                            b.callExpression(
                              b.memberExpression(
                                b.identifier("document"),
                                b.identifier("querySelector"),
                              ),
                              [b.literal("#jss-server-side")],
                            ),
                          ),
                        ]),
                        b.ifStatement(
                          b.logicalExpression(
                            "&&",
                            b.identifier("jssStyles"),
                            b.memberExpression(
                              b.identifier("jssStyles"),
                              b.identifier("parentElement"),
                            ),
                          ),
                          b.blockStatement([
                            b.expressionStatement(
                              b.callExpression(
                                b.memberExpression(
                                  b.memberExpression(
                                    b.identifier("jssStyles"),
                                    b.identifier("parentElement"),
                                  ),
                                  b.identifier("removeChild"),
                                ),
                                [b.identifier("jssStyles")],
                              ),
                            ),
                          ]),
                        ),
                      ]),
                    ),
                    b.arrayExpression([]),
                  ],
                ),
              )

              node.body.body.splice(0, 0, removeServerSideInjectedCss)
            }

            return this.traverse(path)
          },
          visitJSXElement(path) {
            const {node} = path
            if (
              t.JSXIdentifier.check(node.openingElement.name) &&
              // TODO: need a better way to detect the Component
              node.openingElement.name.name === "Component"
            ) {
              path.replace(
                b.jsxElement(
                  b.jsxOpeningElement(b.jsxIdentifier("ThemeProvider"), [
                    b.jsxAttribute(
                      b.jsxIdentifier("theme"),
                      b.jsxExpressionContainer(b.identifier("theme")),
                    ),
                  ]),
                  b.jsxClosingElement(b.jsxIdentifier("ThemeProvider")),
                  [
                    b.literal("\n  \t  "),
                    b.jsxElement(b.jsxOpeningElement(b.jsxIdentifier("CssBaseline"), [], true)),
                    b.literal("\n  \t  "),
                    node,
                    b.literal("\n    "),
                  ],
                ),
              )
              return false
            }

            return this.traverse(path)
          },
        })

        // import React if it wasn't already imported
        if (!isReactImported) {
          const reactImport = b.importDeclaration(
            [b.importDefaultSpecifier(b.identifier("React"))],
            b.literal("react"),
          )
          addImport(ast, b, t, reactImport)
        }

        return ast
      }

      throw new Error("Not given valid source file")
    },
  })
  .build()
