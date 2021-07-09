import {addImport, paths, RecipeBuilder} from "@blitzjs/installer"
import {NodePath} from "ast-types/lib/node-path"
import j, {JSXIdentifier} from "jscodeshift"
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

function updateLabeledTextFieldWithInputComponent(program: Collection<j.Program>) {
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

function replaceOuterDivWithFormControl(program: Collection<j.Program>) {
  program
    .find(j.JSXElement)
    .filter((path) => {
      const {node} = path
      const openingElementNameNode = node?.openingElement?.name as JSXIdentifier

      // This will not include JSX elements within curly braces
      const countOfChildrenJSXElements = path.node.children.filter(
        (childNode) => childNode.type === "JSXElement",
      ).length

      return (
        openingElementNameNode?.name === "div" &&
        node?.openingElement?.selfClosing === false &&
        countOfChildrenJSXElements === 1
      )
    })
    .forEach((path) => {
      path.node.openingElement = j.jsxOpeningElement(
        j.jsxIdentifier("FormControl"),
        path.node.openingElement.attributes,
      )
      path.node.closingElement = j.jsxClosingElement(j.jsxIdentifier("FormControl"))
    })

  return program
}

function replaceInputWithChakraInput(program: Collection<j.Program>) {
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

function replaceLabelWithChakraLabel(program: Collection<j.Program>) {
  program
    .find(j.JSXElement)
    .filter((path) => {
      const {node} = path
      const openingElementNameNode = node?.openingElement?.name as JSXIdentifier

      return openingElementNameNode?.name === "label" && node?.openingElement?.selfClosing === false
    })
    .forEach((path) => {
      path.node.openingElement = j.jsxOpeningElement(
        j.jsxIdentifier("FormLabel"),
        path.node.openingElement.attributes,
      )
      path.node.closingElement = j.jsxClosingElement(j.jsxIdentifier("FormLabel"))
    })

  return program
}

function removeDefaultStyleElement(program: Collection<j.Program>) {
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
  .setName("Chakra UI")
  .setDescription(`This will install all necessary dependencies and configure Chakra UI for use.`)
  .setOwner("zekan.fran369@gmail.com")
  .setRepoLink("https://github.com/blitz-js/blitz")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "npm dependencies",
    explanation: `Chakra UI requires some other dependencies like emotion to work`,
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
    explanation: `Import the chakra-ui provider into _app, so it is accessible in the whole app`,
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
  .addTransformFilesStep({
    stepId: "updateLabeledTextField",
    stepName: "Update the `LabeledTextField` with Chakra UI's `Input` component",
    explanation: `The LabeledTextField component uses Chakra UI's input component`,
    singleFileSearch: "app/core/components/LabeledTextField.tsx",
    transform(program: Collection<j.Program>) {
      // Add ComponentPropsWithoutRef import
      program
        .find(j.ImportDeclaration)
        .filter((importDeclaration) => importDeclaration.node.loc?.start.line === 1)
        .forEach((path) => {
          path.node.specifiers.push(j.importSpecifier(j.identifier("ComponentPropsWithoutRef")))
        })

      const componentPropsWithoutRefImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("Input"))],
        j.literal("@chakra-ui/input"),
      )

      const chakraReactImport = j.importDeclaration(
        [
          j.importSpecifier(j.identifier("FormControl")),
          j.importSpecifier(j.identifier("FormLabel")),
        ],
        j.literal("@chakra-ui/form-control"),
      )

      addImport(program, componentPropsWithoutRefImport)
      addImport(program, chakraReactImport)

      // Imperative steps to describe transformations

      // 1. Update the type of `LabeledTextField`
      updateLabeledTextFieldWithInputComponent(program)

      // 2. Remove the default <style jsx> styling
      removeDefaultStyleElement(program)

      // 3. Replace outer div with `FormControl`
      replaceOuterDivWithFormControl(program)

      // 4. Replace `input` with `ChakraInput`
      replaceInputWithChakraInput(program)

      // 5. Replace `label` with `ChakraLabel`
      replaceLabelWithChakraLabel(program)

      return program
    },
  })
  .build()
