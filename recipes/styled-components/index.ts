import {addBabelPlugin, addImport, paths, Program, RecipeBuilder} from "blitz/installer"
import type {NodePath} from "ast-types/lib/node-path"
import j from "jscodeshift"
import {join} from "path"

function wrapComponentWithStyledComponentsThemeProvider(program: Program) {
  program
    .find(j.JSXElement)
    .filter(
      (path) =>
        path.parent?.parent?.parent?.value?.id?.name === "App" &&
        path.parent?.value.type === j.ReturnStatement.toString(),
    )
    .forEach((path: NodePath) => {
      const {node} = path
      path.replace(
        j.jsxFragment(j.jsxOpeningFragment(), j.jsxClosingFragment(), [
          j.jsxText("\n"),
          j.jsxElement(j.jsxOpeningElement(j.jsxIdentifier("GlobalStyle"), [], true)),
          j.jsxText("\n"),
          j.jsxElement(
            j.jsxOpeningElement(j.jsxIdentifier("ThemeProvider"), [
              j.jsxAttribute(
                j.jsxIdentifier("theme"),
                j.jsxExpressionContainer(j.identifier("theme")),
              ),
            ]),
            j.jsxClosingElement(j.jsxIdentifier("ThemeProvider")),
            [j.jsxText("\n"), node, j.jsxText("\n")],
          ),
          j.jsxText("\n"),
        ]),
      )
    })
  return program
}

export default RecipeBuilder()
  .setName("Styled Components")
  .setDescription(
    `This will install all necessary dependencies and configure Styled Components for use.`,
  )
  .setOwner("Kevin Langley Jr. <me@kevinlangleyjr.com>")
  .setRepoLink("https://github.com/blitz-js/legacy-framework")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "Add dependencies",
    explanation: `Add 'styled-components' as a dependency and 'babel-plugin-styled-components' as a dev dependency.`,
    packages: [
      {name: "styled-components", version: "5.x"},
      {name: "babel-plugin-styled-components", version: "1.x"},
    ],
  })
  .addNewFilesStep({
    stepId: "addThemeUtil",
    stepName: "Add theme util file",
    explanation: `Next, we need to add a util file that will store our theme and global styles.`,
    targetDirectory: "./utils",
    templatePath: join(__dirname, "templates", "utils"),
    templateValues: {},
  })
  .addTransformFilesStep({
    stepId: "modifyGetInitialPropsInCustomDocumentApp",
    stepName: "Add custom getInitialProps logic in Custom Document",
    explanation: `We will add custom getInitialProps logic in _document. We need to do this so that styles are correctly rendered on the server side.`,
    singleFileSearch: paths.document(),
    transform(program) {
      // import ServerStyleSheet
      const serverStyleSheetImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("ServerStyleSheet"))],
        j.literal("styled-components"),
      )

      // Ensure DocumentContext is in the blitz imports.
      program.find(j.ImportDeclaration, {source: {value: "blitz"}}).forEach((blitzImportPath) => {
        let specifiers = blitzImportPath.value.specifiers || []
        if (
          !specifiers
            .filter((spec) => j.ImportSpecifier.check(spec))
            .some((node) => (node as j.ImportSpecifier)?.imported?.name === "DocumentContext")
        ) {
          specifiers.splice(0, 0, j.importSpecifier(j.identifier("DocumentContext")))
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
              j.identifier("sheet"),
              j.newExpression(j.identifier("ServerStyleSheet"), []),
            ),
          ]),
          j.variableDeclaration("const", [
            j.variableDeclarator(
              j.identifier("originalRenderPage"),
              j.memberExpression(j.identifier("ctx"), j.identifier("renderPage")),
            ),
          ]),
          j.tryStatement(
            j.blockStatement([
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
                                j.memberExpression(
                                  j.identifier("sheet"),
                                  j.identifier("collectStyles"),
                                ),
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
                    j.jsxFragment(j.jsxOpeningFragment(), j.jsxClosingFragment(), [
                      j.jsxText("\n"),
                      j.jsxExpressionContainer(
                        j.memberExpression(j.identifier("initialProps"), j.identifier("styles")),
                      ),
                      j.jsxText("\n"),
                      j.jsxExpressionContainer(
                        j.callExpression(
                          j.memberExpression(
                            j.identifier("sheet"),
                            j.identifier("getStyleElement"),
                          ),
                          [],
                        ),
                      ),
                      j.jsxText("\n"),
                    ]),
                  ),
                ]),
              ),
            ]),
            null,
            j.blockStatement([
              j.expressionStatement(
                j.callExpression(
                  j.memberExpression(j.identifier("sheet"), j.identifier("seal")),
                  [],
                ),
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

      addImport(program, serverStyleSheetImport)

      return program
    },
  })
  .addTransformFilesStep({
    stepId: "addThemeProviderToApp",
    stepName: "Import required provider and wrap the root of the app with it",
    explanation: `Additionally we supply ThemeProvider with a basic theme property and base global styles.`,
    singleFileSearch: paths.app(),
    transform(program) {
      // Import styled-components.
      const styledComponentsProviderImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("ThemeProvider"))],
        j.literal("styled-components"),
      )

      const themeImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("theme")), j.importSpecifier(j.identifier("GlobalStyle"))],
        j.literal("utils/theme"),
      )

      addImport(program, styledComponentsProviderImport)
      addImport(program, themeImport)

      return wrapComponentWithStyledComponentsThemeProvider(program)
    },
  })
  .addTransformFilesStep({
    stepId: "updateBabelConfig",
    stepName: "Add Babel plugin and preset",
    explanation: `Update the Babel configuration to use Styled Component's SSR plugin.`,
    singleFileSearch: paths.babelConfig(),
    transform(program) {
      return addBabelPlugin(program, [
        "styled-components",
        {
          ssr: true,
        },
      ])
    },
  })
  .build()
