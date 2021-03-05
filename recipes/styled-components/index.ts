import {addImport, paths, RecipeBuilder} from "@blitzjs/installer"
import {NodePath} from "ast-types/lib/node-path"
import j from "jscodeshift"
import {Collection} from "jscodeshift/src/Collection"

function wrapComponentWithStyledComponentsThemeProvider(program: Collection<j.Program>) {
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

export default RecipeBuilder()
  .setName("Styled Components")
  .setDescription(
    `This will install all necessary dependencies and configure Styled Components for use.`,
  )
  .setOwner("Kevin Langley Jr. <me@kevinlangleyjr.com>")
  .setRepoLink("https://github.com/blitz-js/blitz")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "Add dependencies",
    explanation: `Add 'styled-components' as a dependency and 'babel-plugin-styled-components' as a dev dependency.`,
    packages: [
      {name: "styled-components", version: "latest"},
      {name: "babel-plugin-styled-components", version: "11", isDevDep: true},
    ],
  })
  .addTransformFilesStep({
    stepId: "addThemeProviderToApp",
    stepName: "Import required provider and wrap the root of the app with it",
    explanation: `Additionally we supply ThemeProvider with a basic theme property and base global styles.`,
    singleFileSearch: paths.app(),
    transform(program: Collection<j.Program>) {
      // Import styled-components.
      const styledComponentsProviderImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("ThemeProvider"))],
        j.literal("styled-components"),
      )
      addImport(program, styledComponentsProviderImport)

      // Add basic theme variable.
      program
        .find(j.ExportDefaultDeclaration)
        .at(0)
        .insertBefore(
          j.variableDeclaration("const", [
            j.variableDeclarator(
              j.identifier("theme"),
              j.objectExpression([
                j.objectProperty(
                  j.identifier("colors"),
                  j.objectExpression([
                    j.objectProperty(j.identifier("primary"), j.stringLiteral("#0070f3")),
                  ]),
                ),
              ]),
            ),
          ]),
        )

      return wrapComponentWithStyledComponentsThemeProvider(program)
    },
  })
  .build()
