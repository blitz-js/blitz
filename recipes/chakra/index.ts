import {RecipeBuilder, paths, addImport} from "@blitzjs/installer"
import {builders} from "ast-types/gen/builders"
import {ASTNode} from "ast-types/lib/types"
import {NamedTypes} from "ast-types/gen/namedTypes"
import {visit} from "ast-types"

// Copied from https://github.com/blitz-js/blitz/pull/805, let's add this to the @blitzjs/installer
function wrapComponentWithCacheProvider(ast: ASTNode, b: builders, t: NamedTypes) {
  if (!t.File.check(ast)) return

  visit(ast, {
    visitFunction(path) {
      // const {node} = path
      // TODO: need a better way to detect the custom App function
      // check if is default export
      if (false) {
        return this.traverse(path)
      }
      return false
    },
    visitJSXElement(path) {
      const {node} = path
      path.replace(
        b.jsxElement(
          b.jsxOpeningElement(b.jsxIdentifier("ThemeProvider")),
          b.jsxClosingElement(b.jsxIdentifier("CacheProvider")),
          [
            b.literal("\n  \t  "),
            b.jsxElement(b.jsxOpeningElement({name: "CSSReset", type: "JSXIdentifier"})),
            node,
            b.literal("\n    "),
          ],
        ),
      )
      return false
    },
  })

  return ast
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
    transform(ast: ASTNode, b: builders, t: NamedTypes) {
      const stylesImport = b.importDeclaration(
        [
          b.importSpecifier(b.identifier("CSSReset")),
          b.importSpecifier(b.identifier("ThemeProvider")),
        ],
        b.literal("@chakra/core"),
      )

      if (t.File.check(ast)) {
        addImport(ast, b, t, stylesImport)
        return wrapComponentWithCacheProvider(ast, b, t)!
      }

      throw new Error("Not given valid source file")
    },
  })
  .build()
