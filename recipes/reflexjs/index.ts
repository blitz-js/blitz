import {addBabelPreset, addImport, paths, Program, RecipeBuilder} from "blitz/installer"
import type {NodePath} from "ast-types/lib/node-path"
import j from "jscodeshift"
import {join} from "path"

function wrapComponentWithThemeProvider(program: Program) {
  program
    .find(j.FunctionDeclaration, (node) => node.id.name === "MyApp")
    .forEach((path: NodePath) => {
      const statement = path.value.body.body.filter(
        (b) => b.type === "ReturnStatement",
      )[0] as j.ReturnStatement
      const argument = statement?.argument as j.JSXElement

      statement.argument = j.jsxElement(
        j.jsxOpeningElement(j.jsxIdentifier("ThemeProvider"), [
          j.jsxAttribute(j.jsxIdentifier("theme"), j.jsxExpressionContainer(j.identifier("theme"))),
        ]),
        j.jsxClosingElement(j.jsxIdentifier("ThemeProvider")),
        [j.jsxText("\n"), argument, j.jsxText("\n")],
      )
    })

  return program
}

function injectInitializeColorMode(program: Program) {
  program.find(j.JSXElement, {openingElement: {name: {name: "body"}}}).forEach((path) => {
    const {node} = path
    path.replace(
      j.jsxElement(
        j.jsxOpeningElement(j.jsxIdentifier("body")),
        j.jsxClosingElement(j.jsxIdentifier("body")),
        [
          j.literal("\n"),
          j.jsxElement(j.jsxOpeningElement(j.jsxIdentifier("InitializeColorMode"), [], true)),
          ...(node.children || []),
        ],
      ),
    )
  })

  return program
}

export default RecipeBuilder()
  .setName("Reflexjs")
  .setDescription("This will install all necessary dependencies and configure Reflexjs for use.")
  .setOwner("tundera <stackshuffle@gmail.com>")
  .setRepoLink("https://github.com/blitz-js/legacy-framework")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "npm dependencies",
    explanation: "",
    packages: [{name: "reflexjs", version: "2.x"}],
  })
  .addNewFilesStep({
    stepId: "createTheme",
    stepName: "Add theme",
    explanation: "Adds a theme definition in the `app/core/theme` directory.",
    targetDirectory: "./app/core",
    templatePath: join(__dirname, "templates", "theme"),
    templateValues: {},
  })
  .addTransformFilesStep({
    stepId: "importProviderAndBaseTheme",
    stepName: "Add ThemeProvider component and base theme",
    explanation: "Add ThemeProvider component to `_app` and pass it the theme we just created",
    singleFileSearch: paths.app(),

    transform(program) {
      const providerImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("ThemeProvider"))],
        j.literal("reflexjs"),
      )

      const baseThemeImport = j.importDeclaration(
        [j.importDefaultSpecifier(j.identifier("theme"))],
        j.literal("app/core/theme"),
      )

      addImport(program, providerImport)
      addImport(program, baseThemeImport)
      return wrapComponentWithThemeProvider(program)
    },
  })
  .addTransformFilesStep({
    stepId: "importInitializeColorMode",
    stepName: "Add `InitializeColorMode` component to document body",
    explanation:
      "Add the `InitializeColorMode` component to the document body to support Reflexjs color mode features.",
    singleFileSearch: paths.document(),

    transform(program) {
      const initializeColorModeImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("InitializeColorMode"))],
        j.literal("reflexjs"),
      )

      addImport(program, initializeColorModeImport)
      return injectInitializeColorMode(program)
    },
  })
  .addNewFilesStep({
    stepId: "create babel file",
    stepName: "Create babel file",
    explanation: `Adding default babel file.`,
    targetDirectory: "./babel.config.js",
    templatePath: join(__dirname, "templates", "babel.config.js"),
    templateValues: {},
  })
  .addTransformFilesStep({
    stepId: "updateBabelConfig",
    stepName: "Add Babel preset",
    explanation:
      "Finally, update the Babel configuration to use the Reflfexjs preset. This automatically sets the jsx pragma in your Blitz app so you won't need to import it in your files.",
    singleFileSearch: paths.babelConfig(),

    transform(program) {
      return addBabelPreset(program, [
        "next/babel",
        {
          "preset-react": {
            runtime: "automatic",
            importSource: "reflexjs",
          },
        },
      ])
    },
  })
  .build()
