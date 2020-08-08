import {RecipeBuilder, paths, addImport} from "@blitzjs/installer"
import {builders} from "ast-types/gen/builders"
import {ASTNode} from "ast-types/lib/types"
import {NamedTypes, namedTypes} from "ast-types/gen/namedTypes"
import {visit} from "ast-types"
import {join} from "path"

export default RecipeBuilder()
  .setName("Material-UI")
  .setDescription(
    `Configure your Blitz app's styling with Material-UI. This recipe will install all necessary dependencies and configure a base Material-UI setup for immediate usage.`,
  )
  .setOwner("s.pathak5995@gmail.com")
  .setRepoLink("https://github.com/blitz-js/blitz")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "Add npm dependencies",
    explanation: `@material-ui/core needs to be installed`,
    packages: [{name: "@material-ui/core", version: "latest"}],
  })
  .addNewFilesStep({
    stepId: "addThemeFile",
    stepName: "Add Material-UI theme file",
    explanation: `You can customize the base theme very easily using a theme object in Material-UI. We can setup the base light theme as the starting point`,
    templatePath: join(__dirname, "templates", "theme"),
    templateValues: {},
  })
  .addTransformFilesStep({
    stepId: "importThemeProviderInCustomApp",
    stepName:
      "Customize App and import ThemeProvider with the base theme and CssBaseline component",
    explanation: `We can import the ThemeProvider into _app and the CssBaseline component for easy and consistent usage of the @material-ui components. We will customize the _app component to be remove the server side injected CSS.`,
    singleFileSearch: paths.app(),
    transform(ast: ASTNode, b: builders, t: NamedTypes) {
      if (t.File.check(ast)) {
        // import theme from theme.js
        const themeImport = b.importDeclaration(
          [b.importDefaultSpecifier(b.identifier("theme"))],
          b.literal("../theme"),
        )

        // import ThemeProvider
        const themeProviderImport = b.importDeclaration(
          [b.importSpecifier(b.identifier("ThemeProvider"))],
          b.literal("@material-ui/core/styles"),
        )

        // import CSSBaseline
        const cssBaselineImport = b.importDeclaration(
          [b.importDefaultSpecifier(b.identifier("CssBaseline"))],
          b.literal("@material-ui/core/CssBaseline"),
        )

        addImport(ast, b, t, themeImport)
        addImport(ast, b, t, cssBaselineImport)
        addImport(ast, b, t, themeProviderImport)

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
                  (node: namedTypes.ImportSpecifier | namedTypes.ImportDefaultSpecifier) =>
                    node.type === "ImportDefaultSpecifier",
                )
              ) {
                path.value.specifiers.splice(0, 0, b.importDefaultSpecifier(b.identifier("React")))

                return false
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

              return false
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
                    b.jsxElement(b.jsxOpeningElement(b.jsxIdentifier("CSSBaseline"), [], true)),
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
