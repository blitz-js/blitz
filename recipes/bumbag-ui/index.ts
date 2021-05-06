import j from "jscodeshift"
import {NodePath} from "ast-types/lib/node-path"
import {Collection} from "jscodeshift/src/Collection"
import {addImport, paths, RecipeBuilder} from "@blitzjs/installer"

function wrapComponentWithBumbagProvider(program: Collection<j.Program>) {
  program
    .find(j.JSXElement)
    .filter(
      (path) =>
        path.parent?.parent?.parent?.value?.id?.name === "App" &&
        path.parent?.value.type === j.ReturnStatement.toString(),
    )
    .forEach((path: NodePath) => {
      const {node} = path
      try {
        path.replace(
          j.jsxElement(
            j.jsxOpeningElement(j.jsxIdentifier("BumbagProvider isSSR")),
            j.jsxClosingElement(j.jsxIdentifier("BumbagProvider")),
            [j.jsxText("\n"), node, j.jsxText("\n")],
          ),
        )
      } catch {
        console.error("Already installed recipe")
      }
    })
  return program
}

function injectInitializeColorModeAndExtractCritical(program: Collection<j.Program>) {
  // Finds body element and injects InitializeColorMode before it.
  program.find(j.JSXElement, { openingElement: { name: { name: "body" } } }).forEach((path) => {
    const {node} = path
    path.replace(
      j.jsxElement(
        j.jsxOpeningElement(j.jsxIdentifier("body")),
        j.jsxClosingElement(j.jsxIdentifier("body")),
        [
          j.literal("\n"),
          j.jsxElement(j.jsxOpeningElement(j.jsxIdentifier("InitializeColorMode"), [], true)),
          ...node.children,
        ],
      ),
    )
  })
  // Find ClassDeclaration and insert extractCritical on getInitialProps
  program.find(j.ClassDeclaration).at(0).get().insertAfter(
    `
    MyDocument.getInitialProps = async (ctx) => {
      const initialProps = await Document.getInitialProps(ctx)
      const styles = extractCritical(initialProps.html)
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            <style
              data-emotion-css={styles.ids.join(' ')}
              dangerouslySetInnerHTML={{ __html: styles.css }}
            />
          </>
        ),
      }
    }
    `,
  )
  return program
}

export default RecipeBuilder()
  .setName("Bumbag UI")
  .setDescription(`This will install all necessary dependencies and configure BumbagProvider in your _app and _document`)
  .setOwner("me@agusti.me")
  .setRepoLink("https://github.com/blitz-js/blitz")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "npm dependencies",
    explanation: `Bumbag UI requires both "bumbag" and "bumbag-server" (SSR) npm packages`,
    packages: [
      {name: "bumbag", version: "2.0.0"},
      {name: "bumbag-server", version: "2.0.0"},
    ],
  })
  .addTransformFilesStep({
    stepId: "importBmumbagProvider",
    stepName: "Import BumbagProvider",
    explanation: `Import bumbag Provider as BumbagProvider into _app`,
    singleFileSearch: paths.app(),
    transform(program: Collection<j.Program>) {
      const stylesImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("Provider as BumbagProvider"))],
        j.literal("bumbag"),
      )

      addImport(program, stylesImport)
      return wrapComponentWithBumbagProvider(program)
    },
  })
  .addTransformFilesStep({
    stepId: "ImportExtractCriticalAndInitializeColorMode",
    stepName: "ImportExtractCritical & initializeColorMode",
    explanation: `Import InitializeColorMode from bumbag, and extractCritical into _document`,
    singleFileSearch: paths.document(),
    transform(program: Collection<j.Program>) {
      const initializeColorModeImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("InitializeColorMode"))],
        j.literal("bumbag"),
      )
      const exctractCriticalImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("extractCritical"))],
        j.literal("bumbag-server"),
      )
      addImport(program, initializeColorModeImport)
      addImport(program, exctractCriticalImport)

      return injectInitializeColorModeAndExtractCritical(program)
    },
  })
  .build()
