import {addImport, paths, RecipeBuilder} from "@blitzjs/installer"
import {NodePath} from "ast-types/lib/node-path"
import j from "jscodeshift"
import {Collection} from "jscodeshift/src/Collection"
import {join} from "path"

function wrapComponentWithThemeProvider(program: Collection<j.Program>) {
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
      )
    })

  return program
}

function injectInitializeColorMode(program: Collection<j.Program>) {
  program.find(j.JSXElement, {openingElement: {name: {name: "body"}}}).forEach((path) => {
    const {node} = path
    path.replace(
      j.jsxElement(
        j.jsxOpeningElement(j.jsxIdentifier("body")),
        j.jsxClosingElement(j.jsxIdentifier("body")),
        [
          j.literal("\n"),
          j.jsxElement(j.jsxOpeningElement(j.jsxIdentifier("InitializeColorMode"), [], true)),
          ...node.children,
        ],
      ),
    )
  })

  return program
}

function findModuleExportsExpressions(program: Collection<j.Program>) {
  return program.find(j.AssignmentExpression).filter((path) => {
    return (
      path.value.left.type === "MemberExpression" &&
      (path.value.left.object as any).name === "module" &&
      (path.value.left.property as any).name === "exports" &&
      path.value.right.type === "ObjectExpression"
    )
  })
}

function addBabelPreset(program: Collection<j.Program>, name: string) {
  findModuleExportsExpressions(program).forEach((moduleExportsExpression) => {
    j(moduleExportsExpression)
      .find(j.ObjectProperty, {key: {name: "presets"}})
      .forEach((path) => {
        // TODO: figure out if there's a better way to type plugins.node.value
        const presets = path.node.value as j.ArrayExpression
        presets.elements.push(j.literal(name))
      })
  })

  return program
}

export default RecipeBuilder()
  .setName("Reflexjs")
  .setDescription(
    "Configure your Blitz app's styling with Reflexjs. This recipe will install all necessary dependencies and configure Reflexjs for immediate use.",
  )
  .setOwner("tundera <stackshuffle@gmail.com>")
  .setRepoLink("https://github.com/blitz-js/blitz")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "Add npm dependencies",
    explanation:
      "First, install the `reflexjs` dependency needed to use Reflexjs in our Blitz app.",
    packages: [{name: "reflexjs", version: "1.x"}],
  })
  .addNewFilesStep({
    stepId: "createTheme",
    stepName: "Define a theme",
    explanation: "Define a theme definition in the `app/theme` directory.",
    targetDirectory: "./app",
    templatePath: join(__dirname, "templates", "theme"),
    templateValues: {},
  })
  .addTransformFilesStep({
    stepId: "importProviderAndBaseTheme",
    stepName: "Add ThemeProvider component and base theme",
    explanation:
      "Next, add the ThemeProvider component to `_app` and pass it the theme defined earlier.",
    singleFileSearch: paths.app(),

    transform(program: Collection<j.Program>) {
      const providerImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("ThemeProvider"))],
        j.literal("reflexjs"),
      )

      const baseThemeImport = j.importDeclaration(
        [j.importDefaultSpecifier(j.identifier("theme"))],
        j.literal("app/theme"),
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

    transform(program: Collection<j.Program>) {
      const initializeColorModeImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("InitializeColorMode"))],
        j.literal("reflexjs"),
      )

      addImport(program, initializeColorModeImport)
      return injectInitializeColorMode(program)
    },
  })
  .addTransformFilesStep({
    stepId: "updateBabelConfig",
    stepName: "Add Babel preset",
    explanation:
      "Finally, we'll update the Babel configuration to use the Reflfexjs preset. This automatically sets the jsx pragma in your Blitz app so you won't need to import it in your files.",
    singleFileSearch: paths.babelConfig(),

    transform(program: Collection<j.Program>) {
      console.log("here")
      return addBabelPreset(program, "reflexjs/babel")
    },
  })
  .build()
