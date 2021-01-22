import {addImport, paths, RecipeBuilder} from "@blitzjs/installer"
import {NodePath} from "ast-types/lib/node-path"
import j from "jscodeshift"
import {Collection} from "jscodeshift/src/Collection"

// Copied from https://github.com/blitz-js/blitz/pull/805, let's add this to the @blitzjs/installer
function wrapComponentWithChakraProvider(program: Collection<j.Program>) {
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
          j.jsxOpeningElement(j.jsxIdentifier("ChakraProvider")),
          j.jsxClosingElement(j.jsxIdentifier("ChakraProvider")),
          [j.jsxText("\n"), node, j.jsxText("\n")],
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
      {name: "@chakra-ui/react", version: "1.1.2"},
      {name: "@emotion/react", version: "11.1.4"},
      {name: "@emotion/styled", version: "11.0.0"},
      {name: "framer-motion", version: "3.2.0"},
    ],
  })
  .addTransformFilesStep({
    stepId: "importProviderAndReset",
    stepName: "Import ChakraProvider component",
    explanation: `We can import the chakra provider into _app, so it is accessible in the whole app`,
    singleFileSearch: paths.app(),
    transform(program: Collection<j.Program>) {
      const stylesImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("ChakraProvider"))],
        j.literal("@chakra-ui/react"),
      )

      addImport(program, stylesImport)
      return wrapComponentWithChakraProvider(program)
    },
  })
  .build()
