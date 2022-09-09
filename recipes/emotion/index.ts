import {
  addBabelPlugin,
  addBabelPreset,
  addImport,
  paths,
  Program,
  RecipeBuilder,
} from "blitz/installer"
import j from "jscodeshift"
import {join} from "path"

function applyGlobalStyles(program: Program) {
  program
    .find(j.JSXElement, {openingElement: {name: {name: "ErrorBoundary"}}})
    .forEach((elementPath) => {
      if (Array.isArray(elementPath.node.children)) {
        elementPath.node.children.splice(0, 0, j.literal("\n"))
        elementPath.node.children.splice(
          1,
          0,
          j.jsxExpressionContainer(j.identifier("globalStyles")),
        )
      }
    })
    .get().value.extra.parenthesized = false

  return program
}

export default RecipeBuilder()
  .setName("Emotion")
  .setDescription(`This will install all necessary dependencies and configure Emotion for use.`)
  .setOwner("justin.r.hall+blitz@gmail.com")
  .setRepoLink("https://github.com/blitz-js/legacy-framework")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "npm dependencies",
    explanation: `We'll install @emotion/react and @emotion/styled for general usage, and @emotion/babel-plugin to enable some advanced features.`,
    packages: [
      {name: "@emotion/react", version: "11.x"},
      {name: "@emotion/styled", version: "11.x"},
      {name: "@emotion/babel-plugin", version: "11.x"},
    ],
  })
  .addNewFilesStep({
    stepId: "createGlobalStyles",
    stepName: "Create global styles",
    explanation: `Adding some default global styles, but feel free to customize or even remove them as you see fit.`,
    targetDirectory: "./app/core",
    templatePath: join(__dirname, "templates", "styles"),
    templateValues: {},
  })
  .addTransformFilesStep({
    stepId: "addGlobalStyles",
    stepName: "Import global styles",
    explanation: `Next, we'll import and render the global styles.`,
    singleFileSearch: paths.app(),
    transform(program) {
      const stylesImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("globalStyles"))],
        j.literal("app/core/styles"),
      )

      addImport(program, stylesImport)
      return applyGlobalStyles(program)
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
    stepName: "Add Babel plugin and preset",
    explanation: `Update the Babel configuration to use Emotion's plugin and preset to enable some advanced features.`,
    singleFileSearch: paths.babelConfig(),
    transform(program) {
      program = addBabelPlugin(program, "@emotion")
      program = addBabelPreset(program, [
        "preset-react",
        {runtime: "automatic", importSource: "@emotion/react"},
      ])
      return program
    },
  })
  .build()
