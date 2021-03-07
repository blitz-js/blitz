import {addImport, paths, RecipeBuilder} from "@blitzjs/installer"
import {NodePath} from "ast-types/lib/node-path"
import j from "jscodeshift"
import {Collection} from "jscodeshift/src/Collection"
import {join} from "path"


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
        j.jsxFragment(
          j.jsxOpeningFragment(),
          j.jsxClosingFragment(),
          [
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
            j.jsxText("\n")
          ]
        )
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
  .addNewFilesStep({
    stepId: "addThemeUtil",
    stepName: "Add theme util file",
    explanation: `Next, we need to add a util file that will store our theme and global styles.`,
    targetDirectory: "./utils",
    templatePath: join(__dirname, "templates", "utils"),
    templateValues: {},
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

      const themeImport = j.importDeclaration(
        [
          j.importSpecifier(j.identifier("theme")),
          j.importSpecifier(j.identifier("GlobalStyle")),
        ],
        j.literal("utils/theme"),
      );

      addImport(program, styledComponentsProviderImport)
      addImport(program, themeImport)

      // Still need to apply changes to _document.tsx

      return wrapComponentWithStyledComponentsThemeProvider(program)
    },
  })
  .build()
