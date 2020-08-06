import {RecipeBuilder, paths, addImport} from "@blitzjs/installer"
import {builders} from "ast-types/gen/builders"
import {ASTNode} from "ast-types/lib/types"
import {NamedTypes} from "ast-types/gen/namedTypes"
import {visit} from "ast-types"

// Copied from https://github.com/blitz-js/blitz/pull/805, let's add this to the @blitzjs/installer
// Used as from the chakra recipe at https://github.com/blitz-js/blitz/blob/canary/recipes/chakra
function wrapComponentWithThemeProvider(ast: ASTNode, b: builders, t: NamedTypes) {
  if (!t.File.check(ast)) return

  visit(ast, {
    visitExportDefaultDeclaration(path) {
      // following the example at https://material-ui.com/styles/api/#themeprovider
      // add a base theme without any customization by creating an empty theme object
      path.insertBefore(
        b.variableDeclaration("const", [
          b.variableDeclarator(b.identifier("theme"), b.objectExpression([])),
        ]),
      )

      return this.traverse(path)
    },
    visitJSXElement(path) {
      const {node} = path
      if (
        t.JSXIdentifier.check(node.openingElement.name) &&
        // TODO: need a better way to detect the Component
        node.openingElement.name.name === "Component"
      ) {
        path.replace(
          b.jsxElement(
            b.jsxOpeningElement(b.jsxIdentifier("ThemeProvider"), [
              b.jsxAttribute(
                b.jsxIdentifier("theme"),
                b.jsxExpressionContainer(b.identifier("theme")),
              ),
            ]),
            b.jsxClosingElement(b.jsxIdentifier("ThemeProvider")),
            [
              b.literal("\n  \t  "),
              b.jsxElement(b.jsxOpeningElement(b.jsxIdentifier("CSSBaseline"), [], true)),
              b.literal("\n  \t  "),
              node,
              b.literal("\n    "),
            ],
          ),
        )
        return false
      }
      return this.traverse(path)
    },
  })

  return ast
}

export default RecipeBuilder()
  .setName("Material-UI")
  .setDescription(
    `Configure your Blitz app's styling with Material-UI. This recipe will install all necessary dependencies and configure a base Material-UI setup for immediate usage.`,
  )
  .setOwner("s.pathak5995@gmail.com")
  .setRepoLink("https://github.com/blitz-js/blitz")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "Add npm dependencies",
    explanation: `@material-ui/core needs to be installed`,
    packages: [{name: "@material-ui/core", version: "latest"}],
  })
  .addTransformFilesStep({
    stepId: "importThemeProviderAndReset",
    stepName: "Import ThemeProvider with a base theme and CSSBaseline component",
    explanation: `We can import the ThemeProvider into _app and the CSSBaseline component for easy and consistent usage of the @material-ui components`,
    singleFileSearch: paths.app(),
    transform(ast: ASTNode, b: builders, t: NamedTypes) {
      const imports = b.importDeclaration(
        [
          b.importSpecifier(b.identifier("CSSBaseline")),
          b.importSpecifier(b.identifier("ThemeProvider")),
        ],
        b.literal("@material-ui/core"),
      )

      if (t.File.check(ast)) {
        addImport(ast, b, t, imports)

        return wrapComponentWithThemeProvider(ast, b, t)!
      }

      throw new Error("Not given valid source file")
    },
  })
  .build()
