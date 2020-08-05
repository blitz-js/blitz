import {RecipeBuilder, paths, addImport} from "@blitzjs/installer"
import {builders} from "ast-types/gen/builders"
import {ASTNode} from "ast-types/lib/types"
import {NamedTypes} from "ast-types/gen/namedTypes"
import {visit} from "ast-types"
import j from "jscodeshift"

// Copied from https://github.com/blitz-js/blitz/pull/805, let's add this to the @blitzjs/installer
function wrapComponentWithThemeProvider(ast: ASTNode, b: builders, t: NamedTypes) {
  const fileSource = j(ast)
  fileSource.find(j.JSXIdentifier, {name: "Component"}).forEach((path) => {
    debugger
    j(path).replaceWith(
      j.jsxElement(
        j.jsxOpeningElement(j.jsxIdentifier("ThemeProvider")),
        j.jsxClosingElement(j.jsxIdentifier("ThemeProvider")),
        [
          j.jsxText("\n"),
          j.jsxElement(j.jsxOpeningElement(j.jsxIdentifier("CSSReset"), [], true)),
          j.jsxText("\n"),
          j(path),
          j.jsxText("\n"),
        ],
      ),
    )
  })
  //if (!t.File.check(ast)) return

  //visit(ast, {
  //visitExportDefaultDeclaration(path) {
  //return this.traverse(path)
  //},
  //visitJSXElement(path) {
  //const {node} = path
  //if (
  //t.JSXIdentifier.check(node.openingElement.name) &&
  //// TODO: need a better way to detect the Component
  //node.openingElement.name.name === "Component"
  //) {
  //path.replace(
  //b.jsxElement(
  //b.jsxOpeningElement(b.jsxIdentifier("ThemeProvider")),
  //b.jsxClosingElement(b.jsxIdentifier("ThemeProvider")),
  //[
  //b.jsxText("\n"),
  //b.jsxElement(b.jsxOpeningElement(b.jsxIdentifier("CSSReset"), [], true)),
  //b.jsxText("\n"),
  //node,
  //b.jsxText("\n"),
  //],
  //),
  //)
  //return false
  //}
  //return this.traverse(path)
  //},
  //})

  return ast
}

export default RecipeBuilder()
  .setName("Chakra UI")
  .setDescription(
    `Configure your Blitz app's styling with Chakra UI. This recipe will install all necessary dependencies and configure Chakra UI for immediate use.`,
  )
  .setOwner("zekan.fran369@gmail.com")
  .setRepoLink("https://github.com/blitz-js/blitz")
  //.addAddDependenciesStep({
  //stepId: "addDeps",
  //stepName: "Add npm dependencies",
  //explanation: `Chakra requires some other dependencies like emotion to work`,
  //packages: [
  //{name: "@chakra-ui/core", version: "latest"},
  //{name: "@emotion/core", version: "latest"},
  //{name: "@emotion/styled", version: "latest"},
  //{name: "emotion-theming", version: "latest"},
  //],
  //})
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
        b.literal("@chakra-ui/core"),
      )

      if (t.File.check(ast)) {
        addImport(ast, b, t, stylesImport)
        return wrapComponentWithThemeProvider(ast, b, t)!
      }

      throw new Error("Not given valid source file")
    },
  })
  .build()
