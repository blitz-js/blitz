import {RecipeBuilder, paths, addImport} from "@blitzjs/installer"
import j from "jscodeshift"
import {Collection} from "jscodeshift/src/Collection"
import {join} from "path"

export default RecipeBuilder()
  .setName("Base Web")
  .setDescription(
    `Configure your Blitz app's styling with Base Web. This recipe will install all necessary dependencies and configure Base Web for immediate use.`,
  )
  .setOwner("Konrad Kalemba <konrad@kale.mba>")
  .setRepoLink("https://github.com/blitz-js/blitz")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "Add dependencies",
    explanation: `We need to install 'baseui' which is Base Web's main package containing all components. We need to add Styletron as a dependency too -- it's a toolkit for CSS in JS styling which Base Web relies on.`,
    packages: [
      {name: "baseui", version: "latest"},
      {name: "styletron-engine-atomic", version: "latest"},
      {name: "styletron-react", version: "latest"},
    ],
  })
  .addNewFilesStep({
    stepId: "addStyletronUtil",
    stepName: "Add Styletron util file",
    explanation: `Next, we need to add a util file that will help us to make Styletron work both client- and server-side.`,
    targetDirectory: "./utils",
    templatePath: join(__dirname, "templates", "utils"),
    templateValues: {},
  })
  .addTransformFilesStep({
    stepId: "addStyletronAndBaseProvidersToApp",
    stepName: "Import required providers and wrap the root of the app with them",
    explanation: `Now we need to import StyletronProvider and BaseProvider components and then wrap the application with them. Additionally we supply StyletronProvider with 'value' and 'debug' props. BaseProvider requires a 'theme' prop we set with default Base Web's light theme.`,
    singleFileSearch: paths.app(),
    transform(program: Collection<j.Program>) {
      const styletronProviderImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("Provider"), j.identifier("StyletronProvider"))],
        j.literal("styletron-react"),
      )

      const styletronAndDebugImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("styletron")), j.importSpecifier(j.identifier("debug"))],
        j.literal("utils/styletron"),
      )

      const themeAndBaseProviderImport = j.importDeclaration(
        [
          j.importSpecifier(j.identifier("LightTheme")),
          j.importSpecifier(j.identifier("BaseProvider")),
        ],
        j.literal("baseui"),
      )

      addImport(program, styletronProviderImport)
      addImport(program, styletronAndDebugImport)
      addImport(program, themeAndBaseProviderImport)

      program
        .find(j.JSXExpressionContainer, {expression: {callee: {name: "getLayout"}}})
        .forEach((path) => {
          const {node} = path
          path.replace(
            j.jsxElement(
              j.jsxOpeningElement(j.jsxIdentifier("StyletronProvider"), [
                j.jsxAttribute(
                  j.jsxIdentifier("value"),
                  j.jsxExpressionContainer(j.identifier("styletron")),
                ),
                j.jsxAttribute(
                  j.jsxIdentifier("debug"),
                  j.jsxExpressionContainer(j.identifier("debug")),
                ),
                j.jsxAttribute(j.jsxIdentifier("debugAfterHydration")),
              ]),
              j.jsxClosingElement(j.jsxIdentifier("StyletronProvider")),
              [
                j.literal("\n"),
                j.jsxElement(
                  j.jsxOpeningElement(j.jsxIdentifier("BaseProvider"), [
                    j.jsxAttribute(
                      j.jsxIdentifier("theme"),
                      j.jsxExpressionContainer(j.identifier("LightTheme")),
                    ),
                  ]),
                  j.jsxClosingElement(j.jsxIdentifier("BaseProvider")),
                  [j.literal("\n"), node, j.literal("\n")],
                ),
                j.literal("\n"),
              ],
            ),
          )
        })

      return program
    },
  })
  .addTransformFilesStep({
    stepId: "modifyGetInitialPropsAndAddStylesheetsToDocument",
    stepName: "Modify getInitialProps method and add stylesheets to Document",
    explanation: `To make Styletron work server-side we need to modify getInitialProps method of custom Document class. We also have to put Styletron's generated stylesheets in DocumentHead.`,
    singleFileSearch: paths.document(),
    transform(program: Collection<j.Program>) {
      const styletronProviderImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("Provider"), j.identifier("StyletronProvider"))],
        j.literal("styletron-react"),
      )

      const styletronServerAndSheetImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("Sheet"))],
        j.literal("styletron-engine-atomic"),
      )

      const styletronImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("styletron"))],
        j.literal("utils/styletron"),
      )

      addImport(program, styletronProviderImport)
      addImport(program, styletronServerAndSheetImport)
      addImport(program, styletronImport)

      program.find(j.ImportDeclaration, {source: {value: "blitz"}}).forEach((blitzImportPath) => {
        if (
          !blitzImportPath.value.specifiers
            .filter((spec) => j.ImportSpecifier.check(spec))
            .some((node) => (node as j.ImportSpecifier)?.imported?.name === "DocumentContext")
        ) {
          blitzImportPath.value.specifiers.push(j.importSpecifier(j.identifier("DocumentContext")))
        }
      })

      program.find(j.ClassDeclaration).forEach((path) => {
        const props = j.typeAlias(
          j.identifier("MyDocumentProps"),
          null,
          j.objectTypeAnnotation([
            j.objectTypeProperty(
              j.identifier("stylesheets"),
              j.arrayTypeAnnotation(j.genericTypeAnnotation(j.identifier("Sheet"), null)),
              false,
            ),
          ]),
        )

        path.insertBefore(props)

        path.value.superTypeParameters = j.typeParameterInstantiation([
          j.genericTypeAnnotation(j.identifier("MyDocumentProps"), null),
        ])
      })

      program.find(j.ClassBody).forEach((path) => {
        const {node} = path

        const ctxParam = j.identifier("ctx")
        ctxParam.typeAnnotation = j.tsTypeAnnotation(
          j.tsTypeReference(j.identifier("DocumentContext")),
        )

        const stylesheetsObjectProperty = j.objectProperty(
          j.identifier("stylesheets"),
          j.identifier("stylesheets"),
        )
        stylesheetsObjectProperty.shorthand = true

        const getInitialPropsBody = j.blockStatement([
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
                          j.jsxElement(
                            j.jsxOpeningElement(j.jsxIdentifier("StyletronProvider"), [
                              j.jsxAttribute(
                                j.jsxIdentifier("value"),
                                j.jsxExpressionContainer(j.identifier("styletron")),
                              ),
                            ]),
                            j.jsxClosingElement(j.jsxIdentifier("StyletronProvider")),
                            [
                              j.literal("\n"),
                              j.jsxElement(
                                j.jsxOpeningElement(
                                  j.jsxIdentifier("App"),
                                  [j.jsxSpreadAttribute(j.identifier("props"))],
                                  true,
                                ),
                              ),
                              j.literal("\n"),
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
          j.variableDeclaration("const", [
            j.variableDeclarator(
              j.identifier("stylesheets"),
              j.logicalExpression(
                "||",
                j.callExpression(
                  j.memberExpression(j.identifier("styletron"), j.identifier("getStylesheets")),
                  [],
                ),
                j.arrayExpression([]),
              ),
            ),
          ]),
          j.returnStatement(
            j.objectExpression([
              j.spreadElement(j.identifier("initialProps")),
              stylesheetsObjectProperty,
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

      program
        .find(j.JSXElement, {openingElement: {name: {name: "DocumentHead"}}})
        .forEach((path) => {
          const {node} = path
          path.replace(
            j.jsxElement(
              j.jsxOpeningElement(j.jsxIdentifier("DocumentHead")),
              j.jsxClosingElement(j.jsxIdentifier("DocumentHead")),
              [
                ...node.children,
                j.literal("\n"),
                j.jsxExpressionContainer(
                  j.callExpression(
                    j.memberExpression(
                      j.memberExpression(
                        j.memberExpression(j.thisExpression(), j.identifier("props")),
                        j.identifier("stylesheets"),
                      ),
                      j.identifier("map"),
                    ),
                    [
                      j.arrowFunctionExpression(
                        [j.identifier("sheet"), j.identifier("i")],
                        j.jsxElement(
                          j.jsxOpeningElement(
                            j.jsxIdentifier("style"),
                            [
                              j.jsxAttribute(
                                j.jsxIdentifier("className"),
                                j.literal("_styletron_hydrate_"),
                              ),
                              j.jsxAttribute(
                                j.jsxIdentifier("dangerouslySetInnerHTML"),
                                j.jsxExpressionContainer(
                                  j.objectExpression([
                                    j.objectProperty(
                                      j.identifier("__html"),
                                      j.memberExpression(
                                        j.identifier("sheet"),
                                        j.identifier("css"),
                                      ),
                                    ),
                                  ]),
                                ),
                              ),
                              j.jsxAttribute(
                                j.jsxIdentifier("media"),
                                j.jsxExpressionContainer(
                                  j.memberExpression(
                                    j.memberExpression(
                                      j.identifier("sheet"),
                                      j.identifier("attrs"),
                                    ),
                                    j.identifier("media"),
                                  ),
                                ),
                              ),
                              j.jsxAttribute(
                                j.jsxIdentifier("data-hydrate"),
                                j.jsxExpressionContainer(
                                  j.memberExpression(
                                    j.memberExpression(
                                      j.identifier("sheet"),
                                      j.identifier("attrs"),
                                    ),
                                    j.stringLiteral("data-hydrate"),
                                    true,
                                  ),
                                ),
                              ),
                              j.jsxAttribute(
                                j.jsxIdentifier("key"),
                                j.jsxExpressionContainer(j.jsxIdentifier("i")),
                              ),
                            ],
                            true,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                j.literal("\n"),
              ],
            ),
          )
        })

      return program
    },
  })
  .build()
