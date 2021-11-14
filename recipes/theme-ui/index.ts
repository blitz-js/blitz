import {
  addImport,
  paths,
  Program,
  RecipeBuilder,
  transformBlitzConfig,
  wrapBlitzConfig,
} from "@blitzjs/installer"
import type {NodePath} from "ast-types/lib/node-path"
import j from "jscodeshift"
import {join} from "path"

const NEXT_MDX_PLUGIN_IMPORT = "mdxPlugin"
const NEXT_MDX_PLUGIN_MODULE = "@next/mdx"
const NEXT_MDX_PLUGIN_NAME = "withMDX"
const NEXT_MDX_PLUGIN_OPTIONS = [
  j.property("init", j.identifier("extension"), j.literal(RegExp("mdx?$", ""))),
]

function initializePlugin(program: Program, statement: j.Statement) {
  const importStatementCount = program.find(j.ImportDeclaration).length

  if (importStatementCount === 0) {
    program.find(j.Statement).at(0).insertBefore(statement)
    return program
  }

  program.find(j.ImportDeclaration).forEach((stmt, idx) => {
    if (idx === importStatementCount - 1) {
      stmt.replace(stmt.node, statement)
    }
  })
  return program
}

// Copied from https://github.com/blitz-js/blitz/pull/805, let's add this to the @blitzjs/installer
function wrapComponentWithThemeProvider(program: Program) {
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
          j.jsxOpeningElement(j.jsxIdentifier("ThemeProvider"), [
            j.jsxAttribute(
              j.jsxIdentifier("theme"),
              j.jsxExpressionContainer(j.identifier("theme")),
            ),
            j.jsxAttribute(
              j.jsxIdentifier("components"),
              j.jsxExpressionContainer(j.identifier("components")),
            ),
          ]),
          j.jsxClosingElement(j.jsxIdentifier("ThemeProvider")),
          [j.jsxText("\n"), node, j.jsxText("\n")],
        ),
      )
    })

  return program
}

function injectInitializeColorMode(program: Program) {
  program.find(j.JSXElement, {openingElement: {name: {name: "body"}}}).forEach((path) => {
    const {node} = path
    path.replace(
      j.jsxElement(
        j.jsxOpeningElement(j.jsxIdentifier("body")),
        j.jsxClosingElement(j.jsxIdentifier("body")),
        [
          j.literal("\n"),
          j.jsxElement(j.jsxOpeningElement(j.jsxIdentifier("InitializeColorMode"), [], true)),
          ...(node.children || []),
        ],
      ),
    )
  })

  return program
}

export default RecipeBuilder()
  .setName("Theme UI")
  .setDescription(`This will install all necessary dependencies and configure Theme UI for use.`)
  .setOwner("tundera <stackshuffle@gmail.com>")
  .setRepoLink("https://github.com/blitz-js/blitz")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "npm dependencies",
    explanation: ``,
    packages: [
      {name: "theme-ui", version: "0.x"},
      {name: "@theme-ui/prism", version: "0.x"},
      {name: NEXT_MDX_PLUGIN_MODULE, version: "11.x"},
      {name: "@mdx-js/loader", version: "1.x"},
    ],
  })
  .addTransformFilesStep({
    stepId: "createOrModifyBlitzConfig",
    stepName: "Add the '@next/mdx' plugin to the blitz config file",
    explanation: `Now we have to update our blitz config to support MDX`,
    singleFileSearch: paths.blitzConfig(),

    transform(program) {
      program = addImport(
        program,
        j.importDeclaration(
          [j.importDefaultSpecifier(j.identifier(NEXT_MDX_PLUGIN_IMPORT))],
          j.literal(NEXT_MDX_PLUGIN_MODULE),
        ),
      )

      program = initializePlugin(
        program,
        j.variableDeclaration("const", [
          j.variableDeclarator(
            j.identifier(NEXT_MDX_PLUGIN_NAME),
            j.callExpression(j.identifier(NEXT_MDX_PLUGIN_IMPORT), [
              j.objectExpression(NEXT_MDX_PLUGIN_OPTIONS),
            ]),
          ),
        ]),
      )

      program = transformBlitzConfig(program, (config) => {
        const arr = j.arrayExpression([
          j.literal("js"),
          j.literal("jsx"),
          j.literal("ts"),
          j.literal("tsx"),
          j.literal("md"),
          j.literal("mdx"),
        ])

        const pageExtensionsProp = config.properties.find(
          (value) =>
            value.type === "ObjectProperty" &&
            value.key.type === "Identifier" &&
            value.key.name === "pageExtensions",
        ) as j.ObjectProperty | undefined

        if (pageExtensionsProp) {
          pageExtensionsProp.value = arr
        } else {
          config.properties.push(j.objectProperty(j.identifier("pageExtensions"), arr))
        }

        return config
      })

      return wrapBlitzConfig(program, NEXT_MDX_PLUGIN_NAME)
    },
  })
  .addTransformFilesStep({
    stepId: "importInitializeColorMode",
    stepName: "Add InitializeColorMode component to _document",
    explanation: `We need to import the InitializeColorMode component to support color mode features in Theme UI`,
    singleFileSearch: paths.document(),

    transform(program) {
      const initializeColorModeImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("InitializeColorMode"))],
        j.literal("theme-ui"),
      )

      addImport(program, initializeColorModeImport)
      return injectInitializeColorMode(program)
    },
  })
  .addTransformFilesStep({
    stepId: "importProviderAndBaseTheme",
    stepName: "Import ThemeProvider component and base theme",
    explanation: `We can import the theme provider into _app, so it is accessible in the whole app`,
    singleFileSearch: paths.app(),

    transform(program) {
      const providerImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("ThemeProvider"))],
        j.literal("theme-ui"),
      )

      const baseThemeImport = j.importDeclaration(
        [j.importDefaultSpecifier(j.identifier("theme"))],
        j.literal("app/core/theme"),
      )

      const mdxComponentsImport = j.importDeclaration(
        [j.importDefaultSpecifier(j.identifier("components"))],
        j.literal("app/core/theme/components"),
      )

      addImport(program, providerImport)
      addImport(program, baseThemeImport)
      addImport(program, mdxComponentsImport)
      return wrapComponentWithThemeProvider(program)
    },
  })
  .addNewFilesStep({
    stepId: "addStyles",
    stepName: "Add a base theme file",
    explanation: `Next, we need to actually create some stylesheets! These stylesheets can either be modified to include global styles for your app, or you can stick to just using classnames in your components.`,
    targetDirectory: "./app/core",
    templatePath: join(__dirname, "templates", "theme"),
    templateValues: {},
  })
  .addNewFilesStep({
    stepId: "addMdxLayout",
    stepName: "Create a layout for MDX content",
    explanation:
      "Now we add a layout component for MDX content. We'll add a layout called `MdxLayout.tsx` to the `app/core/layouts` directory. ",
    targetDirectory: "./app/core/layouts",
    templatePath: join(__dirname, "templates", "layouts"),
    templateValues: {},
  })
  .addNewFilesStep({
    stepId: "addMdxLayout",
    stepName: "Add an MDX page",
    explanation:
      "Finally, we'll add a page to `app/pages` called `demo.mdx`. Notice the MDX components defined in `apps/core/theme/components.tsx` appear in place of their corresponding markdown elements.",
    targetDirectory: "./app/core/layouts",
    templatePath: join(__dirname, "templates", "layouts"),
    templateValues: {},
  })
  .build()
