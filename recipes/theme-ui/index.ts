import {addImport, paths, RecipeBuilder} from "@blitzjs/installer"
import {NodePath} from "ast-types/lib/node-path"
import j, {ObjectExpression, variableDeclarator} from "jscodeshift"
import {Collection} from "jscodeshift/src/Collection"
import {join} from "path"

const NEXT_MDX_PLUGIN_NAME = "withMDX"
const NEXT_MDX_PLUGIN_MODULE = "@next/mdx"
const NEXT_MDX_PLUGIN_OPTIONS = [
  j.property("init", j.identifier("extension"), j.literal(RegExp("mdx?$", ""))),
]

const PAGE_EXTENSIONS = [
  j.literal("js"),
  j.literal("jsx"),
  j.literal("ts"),
  j.literal("tsx"),
  j.literal("md"),
  j.literal("mdx"),
]

function findRequires(program: Collection<j.Program>, module: string) {
  return program
    .find(j.CallExpression, {
      callee: {name: "require"},
      arguments: (arg: any) => arg[0].value === module,
    })
    .filter((p: any) => p.value.arguments.length === 1)
}

function addRequire(program: Collection<j.Program>, name: string, module: string) {
  let existingRequire = findRequires(program, module)
  if (existingRequire.find(j.Identifier, {value: module}).length) return program

  const requireToAdd = createRequireStatement(name, module)

  if (!existingRequire.length) {
    program.find(j.Program).get("body", 0).insertBefore(requireToAdd)
  }

  return program
}

function createRequireStatement(name: string, module: string) {
  const require = j.callExpression(j.identifier("require"), [j.literal(module)])

  return j.variableDeclaration("const", [variableDeclarator(j.identifier(name), require)])
}

function wrapBlitzConfigWithNextMdxPlugin(program: Collection<j.Program>) {
  program
    .find(j.Identifier, {
      name: "module",
    })
    .forEach((path) => {
      const exports = path.get("exports").name
      if (exports === "exports") {
        const expression: NodePath = path.parentPath.parentPath
        const {
          node: {right: blitzConfig},
        } = expression

        const configWithPluginWrapper = j.callExpression(j.identifier(NEXT_MDX_PLUGIN_NAME), [
          blitzConfig,
        ])

        const {node} = path.parentPath.parentPath
        node.right = configWithPluginWrapper
      }
    })

  return program
}

function initializeRequire(
  program: Collection<j.Program>,
  name: string,
  module: string,
  expression: ObjectExpression,
) {
  const initCallee = j.callExpression(j.identifier("require"), [j.literal(module)])

  const initializedModule = j.variableDeclarator(
    j.identifier(name),
    j.callExpression(initCallee, [expression]),
  )

  program
    .find(j.VariableDeclarator, {
      id: {name: NEXT_MDX_PLUGIN_NAME},
      init: {callee: {name: "require"}},
    })
    .forEach((path) => {
      path.replace(initializedModule)
    })
    .toSource()

  return program
}

// Copied from https://github.com/blitz-js/blitz/pull/805, let's add this to the @blitzjs/installer
function wrapComponentWithThemeProvider(program: Collection<j.Program>) {
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

  return program
}

export default RecipeBuilder()
  .setName("Theme UI")
  .setDescription(
    `Configure your Blitz app's styling with Theme UI. This recipe will install all necessary dependencies and configure Theme UI for immediate use.`,
  )
  .setOwner("tundera <stackshuffle@gmail.com>")
  .setRepoLink("https://github.com/blitz-js/blitz")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "Add npm dependencies",
    explanation: `First, we'll install the dependencies needed to use Theme UI in our Blitz app.`,
    packages: [
      {name: "theme-ui", version: "latest"},
      {name: NEXT_MDX_PLUGIN_MODULE, version: "latest"},
      {name: "@mdx-js/loader", version: "latest"},
    ],
  })
  .addTransformFilesStep({
    stepId: "createOrModifyBlitzConfig",
    stepName: "Add the '@next/mdx' plugin to the blitz config file",
    explanation: `Now we have to update our blitz config to support MDX`,
    singleFileSearch: paths.blitzConfig(),

    transform(program: Collection<j.Program>) {
      const initExpression = j.objectExpression(NEXT_MDX_PLUGIN_OPTIONS)

      addRequire(program, NEXT_MDX_PLUGIN_NAME, NEXT_MDX_PLUGIN_MODULE)
      initializeRequire(program, NEXT_MDX_PLUGIN_NAME, NEXT_MDX_PLUGIN_MODULE, initExpression)
      return wrapBlitzConfigWithNextMdxPlugin(program)
    },
  })
  .addTransformFilesStep({
    stepId: "importInitializeColorMode",
    stepName: "Add InitializeColorMode component to _document",
    explanation: `We need to import the InitializeColorMode component to support color mode features in Theme UI`,
    singleFileSearch: paths.document(),

    transform(program: Collection<j.Program>) {
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

    transform(program: Collection<j.Program>) {
      const providerImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("ThemeProvider"))],
        j.literal("theme-ui"),
      )

      const baseThemeImport = j.importDeclaration(
        [j.importDefaultSpecifier(j.identifier("theme"))],
        j.literal("app/theme"),
      )

      const mdxComponentsImport = j.importDeclaration(
        [j.importDefaultSpecifier(j.identifier("components"))],
        j.literal("app/theme/components"),
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
    targetDirectory: "./app",
    templatePath: join(__dirname, "templates", "theme"),
    templateValues: {},
  })
  .addNewFilesStep({
    stepId: "addMdxLayout",
    stepName: "Create a layout MDX pages",
    explanation:
      "Now we add a layout component for MDX content. We'll add a layout called `MdxLayout.tsx` to the `app/layouts` directory. ",
    targetDirectory: "./app/layouts",
    templatePath: join(__dirname, "templates", "layouts"),
    templateValues: {},
  })
  .build()
