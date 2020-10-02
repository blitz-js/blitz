import {RecipeBuilder, paths, addImport} from "@blitzjs/installer"
import j from "jscodeshift"
import {NodePath} from "ast-types/lib/node-path"
import {Collection} from "jscodeshift/src/Collection"

// Copied from https://github.com/blitz-js/blitz/pull/805, let's add this to the @blitzjs/installer
function wrapComponentWithThemeProvider(program: Collection<j.Program>) {
  program.find(j.JSXIdentifier, {name: "Component"}).forEach((path: NodePath) => {
    j(path.parent).replaceWith(
      j.jsxElement(
        j.jsxOpeningElement(j.jsxIdentifier("ThemeProvider")),
        j.jsxClosingElement(j.jsxIdentifier("ThemeProvider")),
        [
          j.jsxText("\n"),
          j.jsxElement(j.jsxOpeningElement(j.jsxIdentifier("CSSReset"), [], true)),
          j.jsxText("\n"),
          path.parent.parent.node,
          j.jsxText("\n"),
        ],
      ),
    )
  })
  return program
}

export default RecipeBuilder()
  .setName("Chakra UI")
  .setDescription(
    `Configure your Blitz app's styling with Chakra UI. This recipe will install all necessary dependencies and configure Chakra UI for immediate use.`,
  )
  .setOwner("zekan.fran369@gmail.com")
  .setRepoLink("https://github.com/blitz-js/blitz")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "Add npm dependencies",
    explanation: `Chakra requires some other dependencies like emotion to work`,
    packages: [
      {name: "@chakra-ui/core", version: "latest"},
      {name: "@emotion/core", version: "latest"},
      {name: "@emotion/styled", version: "latest"},
      {name: "emotion-theming", version: "latest"},
    ],
  })
  .addTransformFilesStep({
    stepId: "importProviderAndReset",
    stepName: "Import ThemeProvider and CSSReset component",
    explanation: `We can import the chakra provider into _app, so it is accessibly in the whole app`,
    singleFileSearch: paths.app(),
    transform(program: Collection<j.Program>) {
      const stylesImport = j.importDeclaration(
        [
          j.importSpecifier(j.identifier("CSSReset")),
          j.importSpecifier(j.identifier("ThemeProvider")),
        ],
        j.literal("@chakra-ui/core"),
      )

      addImport(program, stylesImport)
      return wrapComponentWithThemeProvider(program)
    },
  })
  .build()
