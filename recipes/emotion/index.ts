import {addImport, paths, RecipeBuilder} from "@blitzjs/installer"
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

function findModuleExportsExpressions(program: Collection<j.Program>) {
  return program.find(j.AssignmentExpression).filter((path) => {
    return (
      path.value.left.type === "MemberExpression" &&
      // TODO: figure out if there's a better way to type path.value.left
      (path.value.left.object as any).name === "module" &&
      (path.value.left.property as any).name === "exports" &&
      path.value.right.type === "ObjectExpression"
    )
  })
}

function addBabelPlugin(program: Collection<j.Program>) {
  findModuleExportsExpressions(program).forEach((moduleExportsExpression) => {
    j(moduleExportsExpression)
      .find(j.ObjectProperty, {key: {name: "plugins"}})
      .forEach((plugins) => {
        // TODO: figure out if there's a better way to type plugins.node.value
        ;(plugins.node.value as j.ArrayExpression).elements.push(j.literal("@emotion"))
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
          .find(j.Literal, {value: "next/babel"})
          .replaceWith(
            j.arrayExpression([
              j.stringLiteral("next/babel"),
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
  .setDescription(
    `Configure your Blitz app's styling with Emotion CSS-in-JS. This recipe will install all necessary dependencies and configure Emotion for immediate use.`,
  )
  .setOwner("justin.r.hall+blitz@gmail.com")
  .setRepoLink("https://github.com/blitz-js/blitz")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "Add npm dependencies",
    explanation: `Emotion requires a few dependencies to get up and running.
  We'll install @emotion/react and @emotion/styled for general usage, and @emotion/babel-plugin to enable some advanced features.`,
    packages: [
      {name: "@emotion/react", version: "11"},
      {name: "@emotion/styled", version: "11"},
      {name: "@emotion/babel-plugin", version: "11", isDevDep: true},
    ],
  })
  .addNewFilesStep({
    stepId: "createGlobalStyles",
    stepName: "Create global styles",
    explanation: `First, we will create some styles. We'll provide some default global styles, but feel free to customize or even remove them as you see fit.`,
    targetDirectory: "./app",
    templatePath: join(__dirname, "templates", "styles"),
    templateValues: {},
  })
  .addTransformFilesStep({
    stepId: "addGlobalStyles",
    stepName: "Apply global styles",
    explanation: `Next, we'll import and render the global styles.`,
    singleFileSearch: paths.app(),
    transform(program: Collection<j.Program>) {
      const stylesImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("globalStyles"))],
        j.literal("app/styles"),
      )

      addImport(program, stylesImport)
      return applyGlobalStyles(program)
    },
  })
  .addTransformFilesStep({
    stepId: "updateBabelConfig",
    stepName: "Add Babel plugin and preset",
    explanation: `Finally, we'll update the Babel configuration to use Emotion's plugin and preset to enable some advanced features.`,
    singleFileSearch: paths.babelConfig(),
    transform(program: Collection<j.Program>) {
      addBabelPlugin(program)
      return replaceBabelPreset(program)
    },
  })
  .build()
