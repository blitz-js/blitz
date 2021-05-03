import {addImport, paths, RecipeBuilder} from "@blitzjs/installer"
import {NodePath} from "ast-types/lib/node-path"
import j from "jscodeshift"
import {Collection} from "jscodeshift/src/Collection"

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
function injectInitializeColorMode(program: Collection<j.Program>) {
  program.find(j.JSXElement, {openingElement: {name: {name: "body"}}}).forEach((path) => {
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

  j(program.find(j.ClassDeclaration).at(0).get()).insertAfter(
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
  .setDescription(`This will install all necessary dependencies and configure Bumbag UI for use.`)
  .setOwner("me@agusti.me")
  .setRepoLink("https://github.com/blitz-js/blitz")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "npm dependencies",
    explanation: `Bumbag UI requires bumbag-server to handle properly SSR`,
    packages: [
      {name: "bumbag", version: "2.0.0"},
      {name: "bumbag-server", version: "2.0.0"},
    ],
  })
  .addTransformFilesStep({
    stepId: "importBmumbagProvider",
    stepName: "Import BumbagProvider",
    explanation: `Import the bumbag provider into _app, so it is accessible in the whole app`,
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
    explanation: `Import the bumbag-ui provider into _app, so it is accessible in the whole app`,
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

      return injectInitializeColorMode(program)
    },
  })
  .build()
