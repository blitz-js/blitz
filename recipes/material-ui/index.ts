import {addImport, paths, RecipeBuilder, withTypeAnnotation} from "blitz/installer"
import j from "jscodeshift"
import {join} from "path"

export default RecipeBuilder()
  .setName("Material-UI")
  .setDescription(
    "Configure your Blitz app's styling with Material-UI. This recipe will install all necessary dependencies and configure a base Material-UI setup for usage.",
  )
  .setOwner("s.pathak5995@gmail.com")
  .setRepoLink("https://github.com/blitz-js/legacy-framework")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "Add npm dependencies",
    explanation: `@mui/material needs to be installed`,
    packages: [
      {name: "@mui/material", version: "5.x"},
      {name: "@emotion/cache", version: "11.x"},
      {name: "@emotion/react", version: "11.x"},
      {name: "@emotion/server", version: "11.x"},
      {name: "@emotion/styled", version: "11.x"},
    ],
  })
  .addTransformFilesStep({
    stepId: "importThemeProviderInCustomApp",
    stepName: "Customize App and import ThemeProvider with a base theme and CssBaseline component",
    explanation: `We will import the ThemeProvider into _app and the CssBaseline component for easy and consistent usage of the @mui components. We will also customize the _app component to be remove the server side injected CSS.`,
    singleFileSearch: paths.app(),
    transform(program) {
      // import { ThemeProvider } from '@mui/material/styles'
      addImport(
        program,
        j.importDeclaration(
          [j.importSpecifier(j.identifier("ThemeProvider"))],
          j.literal("@mui/material/styles"),
        ),
      )

      // import CssBaseline from '@mui/material/CssBaseline'
      addImport(
        program,
        j.importDeclaration(
          [j.importDefaultSpecifier(j.identifier("CssBaseline"))],
          j.literal("@mui/material/CssBaseline"),
        ),
      )

      // import { CacheProvider, EmotionCache } from '@emotion/react'
      addImport(
        program,
        j.importDeclaration(
          [
            j.importSpecifier(j.identifier("CacheProvider")),
            j.importSpecifier(j.identifier("EmotionCache")),
          ],
          j.literal("@emotion/react"),
        ),
      )

      // import theme from 'app/styles/theme'
      addImport(
        program,
        j.importDeclaration(
          [j.importDefaultSpecifier(j.identifier("theme"))],
          j.literal("app/styles/theme"),
        ),
      )

      // import createEmotionCache from 'app/utils/createEmotionCache'
      addImport(
        program,
        j.importDeclaration(
          [j.importDefaultSpecifier(j.identifier("createEmotionCache"))],
          j.literal("app/utils/createEmotionCache"),
        ),
      )

      program.find(j.ImportDeclaration).forEach((i, idx, path) => {
        if (idx !== path.length - 1) {
          return
        }

        path[path.length - 1]?.insertAfter(
          j.interfaceDeclaration(
            j.identifier("MyAppProps"),
            j.objectTypeAnnotation([
              j.objectTypeProperty(
                j.identifier("emotionCache"),
                j.typeParameter("EmotionCache"),
                true,
              ),
            ]),
            [j.interfaceExtends(j.identifier("AppProps"))],
          ),
        )

        path[path.length - 1]?.insertAfter(
          j.variableDeclaration("const", [
            j.variableDeclarator(
              j.identifier("clientSideEmotionCache"),
              j.callExpression(j.identifier("createEmotionCache"), []),
            ),
          ]),
        )
      })

      program
        .find(j.FunctionDeclaration)
        .filter((path) => path.value?.id?.name === "MyApp")
        .forEach((path) => {
          let objProps = [
            j.property("init", j.identifier("Component"), j.identifier("Component")),
            j.property("init", j.identifier("pageProps"), j.identifier("pageProps")),
            j.property(
              "init",
              j.identifier("emotionCache"),
              j.assignmentPattern(
                j.identifier("emotionCache"),
                j.identifier("clientSideEmotionCache"),
              ),
            ),
          ].map((prop) => {
            prop.shorthand = true
            return prop
          })

          path.node.params = [
            withTypeAnnotation(
              j.objectPattern(objProps),
              j.tsTypeReference(j.identifier("MyAppProps")),
            ),
          ]
        })

      program
        .find(j.FunctionDeclaration, (node) => node.id.name === "MyApp")
        .forEach((path) => {
          const statement = path.value.body.body.filter(
            (b) => b.type === "ReturnStatement",
          )[0] as j.ReturnStatement
          const argument = statement?.argument as j.JSXElement

          statement.argument = j.jsxElement(
            j.jsxOpeningElement(j.jsxIdentifier("CacheProvider"), [
              j.jsxAttribute(
                j.jsxIdentifier("value"),
                j.jsxExpressionContainer(j.identifier("emotionCache")),
              ),
            ]),
            j.jsxClosingElement(j.jsxIdentifier("CacheProvider")),
            [
              j.literal("\n"),
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
                  argument,
                  j.literal("\n"),
                ],
              ),
              j.literal("\n"),
            ],
          )
        })

      return program
    },
  })
  .addNewFilesStep({
    stepId: "addFiles",
    stepName: "Add new files",
    explanation: "Add a theme file with all your customizations and a emotion cache file",
    templatePath: join(__dirname, "templates/core"),
    targetDirectory: "./app",
    templateValues: {},
  })
  .addNewFilesStep({
    stepId: "addFilesDocument",
    stepName: "Add new files",
    explanation: "Add an updated _document,",
    templatePath: join(__dirname, "templates/pages"),
    targetDirectory: "./pages",
    templateValues: {},
  })
  .build()
