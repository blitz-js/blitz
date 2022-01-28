import {addImport, paths, Program, RecipeBuilder} from "@blitzjs/installer"
import type {NodePath} from "ast-types/lib/node-path"
import j, {JSXIdentifier} from "jscodeshift"

// Copied from https://github.com/blitz-js/blitz/pull/805, let's add this to the @blitzjs/installer
function wrapComponentWithChakraProvider(program: Program) {
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
          j.jsxOpeningElement(j.jsxIdentifier("NextUIProvider")),
          j.jsxClosingElement(j.jsxIdentifier("NextUIProvider")),
          [j.jsxText("\n"), node, j.jsxText("\n")],
        ),
      )
    })
  return program
}

function updateLabeledTextFieldWithInputComponent(program: Program) {
  program
    .find(j.TSInterfaceDeclaration)
    .find(j.TSExpressionWithTypeArguments)
    .forEach((path: j.ASTPath<j.TSExpressionWithTypeArguments>) => {
      path.replace(
        j.tsExpressionWithTypeArguments(
          j.identifier("ComponentPropsWithoutRef"),
          j.tsTypeParameterInstantiation([j.tsTypeQuery(j.identifier("Input"))]),
        ),
      )
    })

  return program
}

function replaceInputWithChakraInput(program: Program) {
  program
    .find(j.JSXElement)
    .filter((path) => {
      const {node} = path
      const openingElementNameNode = node?.openingElement?.name as JSXIdentifier

      return openingElementNameNode?.name === "input" && node?.openingElement?.selfClosing === true
    })
    .forEach((path) => {
      const {node} = path
      node.openingElement = j.jsxOpeningElement(
        j.jsxIdentifier("Input"),
        node.openingElement.attributes,
        node?.openingElement?.selfClosing,
      )
    })

  return program
}

function removeDefaultStyleElement(program: Program) {
  program
    .find(j.JSXElement)
    .filter((path) => {
      const {node} = path
      const openingElementNameNode = node?.openingElement?.name as JSXIdentifier

      // Assumes there's one style element at the point the user runs the recipe.
      return openingElementNameNode?.name === "style" && node?.openingElement?.selfClosing === false
    })
    .forEach((path) => {
      // Removes the node.
      path.replace()
    })

  return program
}

export default RecipeBuilder()
  .setName("Next UI")
  .setDescription(`This will install all necessary dependencies and configure Next UI for use.`)
  .setOwner("moyurusuto.mochi@gmail.com")
  .setRepoLink("https://github.com/blitz-js/blitz")
  .addAddDependenciesStep({
    stepId: "Install",
    stepName: "Insstall Next UI",
    explanation: `Import the chakra-ui provider into _app, so it is accessible in the whole app`,
    packages: [{name: "@nextui-org/react", version: "1.x"}],
  })
  .addTransformFilesStep({
    stepId: "importProviderAndReset",
    stepName: "Import ChakraProvider component",
    explanation: `Import the chakra-ui provider into _app, so it is accessible in the whole app`,
    singleFileSearch: paths.app(),
    transform(program) {
      const stylesImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("NextUIProvider"))],
        j.literal("@nextui-org/react"),
      )

      addImport(program, stylesImport)
      return wrapComponentWithChakraProvider(program)
    },
  })
  .addTransformFilesStep({
    stepId: "updateLabeledTextField",
    stepName: "Update the `LabeledTextField` with Chakra UI's `Input` component",
    explanation: `The LabeledTextField component uses Chakra UI's input component`,
    singleFileSearch: "app/core/components/LabeledTextField.tsx",
    transform(program) {
      // Add ComponentPropsWithoutRef import
      program.find(j.ImportDeclaration, {source: {value: "react"}}).forEach((path) => {
        let specifiers = path.value.specifiers || []
        if (
          !specifiers.some(
            (node) => (node as j.ImportSpecifier)?.imported?.name === "ComponentPropsWithoutRef",
          )
        ) {
          specifiers.push(j.importSpecifier(j.identifier("ComponentPropsWithoutRef")))
        }
      })

      const chakraInputImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("Input"))],
        j.literal("@nextui-org/react"),
      )

      addImport(program, chakraInputImport)

      // Imperative steps to describe transformations

      // 1. Update the type of `LabeledTextField`
      updateLabeledTextFieldWithInputComponent(program)

      // 2. Remove the default <style jsx> styling
      removeDefaultStyleElement(program)

      // 4. Replace `input` with `ChakraInput`
      replaceInputWithChakraInput(program)

      return program
    },
  })
  .build()
