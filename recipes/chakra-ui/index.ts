import {addImport, paths, Program, RecipeBuilder, wrapAppWithProvider} from "blitz/installer"
import j, {JSXIdentifier} from "jscodeshift"

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

function replaceOuterDivWithFormControl(program: Program) {
  program
    .find(j.JSXElement)
    .filter((path) => {
      const {node} = path
      const openingElementNameNode = node?.openingElement?.name as JSXIdentifier

      // This will not include JSX elements within curly braces
      const countOfChildrenJSXElements =
        path.node.children?.filter((childNode) => childNode.type === "JSXElement").length || 0

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

function replaceLabelWithChakraLabel(program: Program) {
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
  .setName("Chakra UI")
  .setDescription(`This will install all necessary dependencies and configure Chakra UI for use.`)
  .setOwner("zekan.fran369@gmail.com")
  .setRepoLink("https://github.com/blitz-js/legacy-framework")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "npm dependencies",
    explanation: `Chakra UI requires some other dependencies like emotion to work`,
    packages: [
      {name: "@chakra-ui/react", version: "1.x"},
      {name: "@emotion/react", version: "11.x"},
      {name: "@emotion/styled", version: "11.x"},
      {name: "framer-motion", version: "5.x"},
    ],
  })
  .addTransformFilesStep({
    stepId: "importProviderAndReset",
    stepName: "Import ChakraProvider component",
    explanation: `Import the chakra-ui provider into _app, so it is accessible in the whole app`,
    singleFileSearch: paths.app(),
    transform(program) {
      const stylesImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("ChakraProvider"))],
        j.literal("@chakra-ui/react"),
      )

      addImport(program, stylesImport)
      return wrapAppWithProvider(program, "ChakraProvider")
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
        j.literal("@chakra-ui/input"),
      )

      const chakraFormControlImport = j.importDeclaration(
        [
          j.importSpecifier(j.identifier("FormControl")),
          j.importSpecifier(j.identifier("FormLabel")),
        ],
        j.literal("@chakra-ui/form-control"),
      )

      addImport(program, chakraInputImport)
      addImport(program, chakraFormControlImport)

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
