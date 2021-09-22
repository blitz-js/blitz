import {
  addBabelPlugin,
  addImport,
  findModuleExportsExpressions,
  paths,
  RecipeBuilder,
} from "@blitzjs/installer"
import j from "jscodeshift"
import {Collection} from "jscodeshift/src/Collection"
import {join} from "path"

function applyGlobalStyles(program: Collection<j.Program>) {
  program.find(j.ExportDefaultDeclaration).forEach((exportPath) => {
    j(exportPath)
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
  })

  return program
}

function replaceBabelPreset(program: Collection<j.Program>) {
  findModuleExportsExpressions(program).forEach((moduleExportsExpression) => {
    j(moduleExportsExpression)
      .find(j.ObjectProperty, {key: {name: "presets"}})
      .forEach((presets) => {
        j(presets)
          .find(j.Literal, {value: "blitz/babel"})
          .replaceWith(
            j.arrayExpression([
              j.stringLiteral("blitz/babel"),
              j.objectExpression([
                j.property(
                  "init",
                  j.identifier('"preset-react"'),
                  j.objectExpression([
                    j.property("init", j.identifier("runtime"), j.literal("automatic")),
                    j.property("init", j.identifier("importSource"), j.literal("@emotion/react")),
                  ]),
                ),
              ]),
            ]),
          )
      })
  })

  return program
}

export default RecipeBuilder()
  .setName("Emotion")
  .setDescription(`This will install all necessary dependencies and configure Emotion for use.`)
  .setOwner("justin.r.hall+blitz@gmail.com")
  .setRepoLink("https://github.com/blitz-js/blitz")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "npm dependencies",
    explanation: `We'll install @emotion/react and @emotion/styled for general usage, and @emotion/babel-plugin to enable some advanced features.`,
    packages: [
      {name: "@emotion/react", version: "11"},
      {name: "@emotion/styled", version: "11"},
      {name: "@emotion/babel-plugin", version: "11"},
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
    transform(program: Collection<j.Program>) {
      const stylesImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("globalStyles"))],
        j.literal("app/core/styles"),
      )

      addImport(program, stylesImport)
      return applyGlobalStyles(program)
    },
  })
  .addTransformFilesStep({
    stepId: "updateBabelConfig",
    stepName: "Add Babel plugin and preset",
    explanation: `Update the Babel configuration to use Emotion's plugin and preset to enable some advanced features.`,
    singleFileSearch: paths.babelConfig(),
    transform(program: Collection<j.Program>) {
      addBabelPlugin(program, "@emotion")
      return replaceBabelPreset(program)
    },
  })
  .build()
