import {RecipeBuilder, paths, addImport} from "@blitzjs/installer"
import {join} from "path"
import {builders} from "ast-types/gen/builders"
import {ASTNode} from "ast-types/lib/types"
import {NamedTypes} from "ast-types/gen/namedTypes"
import {types, visit} from "recast"

function wrapComponentWithCacheProvider(ast: ASTNode, b: builders, t: NamedTypes) {
  if (!t.File.check(ast)) return

  visit(ast, {
    visitFunction(path) {
      const {node} = path
      // TODO: need a better way to detect the custom App function
      if (t.Identifier.check(node.id) && node.id.name === "MyApp") {
        return this.traverse(path)
      }
      return false
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
            b.jsxOpeningElement(b.jsxIdentifier("CacheProvider"), [
              b.jsxAttribute(
                b.jsxIdentifier("value"),
                b.jsxExpressionContainer(b.identifier("cache")),
              ),
            ]),
            b.jsxClosingElement(b.jsxIdentifier("CacheProvider")),
            [b.literal("\n  \t  "), node, b.literal("\n    ")],
          ),
        )
        return false
      }
      return this.traverse(path)
    },
  })

  return ast
}

function applyGlobalStyles(ast: ASTNode, b: builders, t: NamedTypes) {
  if (!t.File.check(ast)) return

  visit(ast, {
    visitFunction(path) {
      const {node} = path
      // TODO: need a better way to detect the custom App function
      if (t.Identifier.check(node.id) && node.id.name === "MyApp") {
        return this.traverse(path)
      }
      return false
    },
    visitJSXElement(path) {
      const {node} = path
      // TODO: need a better way to detect the CacheProvider
      if (
        t.JSXIdentifier.check(node.openingElement.name) &&
        node.openingElement.name.name === "CacheProvider"
      ) {
        if (Array.isArray(node.children)) {
          node.children.splice(0, 0, b.literal("\n      "))
          node.children.splice(1, 0, b.jsxExpressionContainer(b.identifier("globalStyles")))
        }
        return false
      }
      return this.traverse(path)
    },
  })

  return ast
}

function addMethodToCustomDocument(
  ast: ASTNode,
  __b: builders,
  t: NamedTypes,
  methodToAdd: types.namedTypes.MethodDefinition,
) {
  if (!t.File.check(ast) || !t.MethodDefinition.check(methodToAdd)) return

  visit(ast, {
    visitClassDeclaration(path) {
      const {node} = path
      if (t.Identifier.check(node.superClass) && node.superClass.name === "Document") {
        return this.traverse(path)
      }
      return false
    },
    visitClassBody(path) {
      const {node} = path
      // TODO: check if method already exists and modify rather than inserting new?
      node.body.splice(0, 0, methodToAdd)
      return false
    },
  })

  return ast
}

export default RecipeBuilder()
  .setName("Emotion")
  .setDescription(
    `Configure your Blitz app's styling with Emotion CSS-in-JS. This recipe will install all necessary dependencies and configure Emotion for immediate use.`,
  )
  .setOwner("justin.r.hall@gmail.com")
  .setRepoLink("https://github.com/blitz-js/blitz")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "Add npm dependencies",
    explanation: `Emotion requires a few dependencies to get up and running.
We'll install @emotion/core and @emotion/styled for general usage, as well as emotion and emotion-server to extract and inline critical CSS on the server.`,
    packages: [
      {name: "@emotion/core", version: "10"},
      {name: "@emotion/styled", version: "10"},
      {name: "emotion", version: "10"},
      {name: "emotion-server", version: "10"},
    ],
  })
  .addNewFilesStep({
    stepId: "createGlobalStyles",
    stepName: "Create global styles",
    explanation: `First, we will create some styles. We'll provide some default global styles, but feel free to customize or even remove them as you see fit.`,
    targetDirectory: "./app",
    templatePath: join(__dirname, "templates", "styles"),
    templateValues: {},
  })
  .addTransformFilesStep({
    stepId: "cacheProvider",
    stepName: "Enable Emotion's built-in cache",
    explanation: `Next, we wrap our app-level Component in Emotion's CacheProvider with their built-in cache to enable server-side rendering of our styles.`,
    singleFileSearch: paths.app(),
    transform(ast: ASTNode, b: builders, t: NamedTypes) {
      const cacheProviderImport = b.importDeclaration(
        [b.importSpecifier(b.identifier("CacheProvider"))],
        b.literal("@emotion/core"),
      )

      const cacheImport = b.importDeclaration(
        [b.importSpecifier(b.identifier("cache"))],
        b.literal("emotion"),
      )

      if (t.File.check(ast)) {
        addImport(ast, b, t, cacheImport)
        addImport(ast, b, t, cacheProviderImport)
        return wrapComponentWithCacheProvider(ast, b, t)!
      }
      throw new Error("Not given valid source file")
    },
  })
  .addTransformFilesStep({
    stepId: "addGlobalStyles",
    stepName: "Apply global styles",
    explanation: `Now we'll import and render the global styles.`,
    singleFileSearch: paths.app(),
    transform(ast: ASTNode, b: builders, t: NamedTypes) {
      const stylesImport = b.importDeclaration(
        [b.importSpecifier(b.identifier("globalStyles"))],
        b.literal("app/styles"),
      )

      if (t.File.check(ast)) {
        addImport(ast, b, t, stylesImport)
        return applyGlobalStyles(ast, b, t)!
      }
      throw new Error("Not given valid source file")
    },
  })
  .addTransformFilesStep({
    stepId: "extractCritical",
    stepName: "Extract critical CSS",
    explanation: `We will now call Emotion's extractCritical function in the getInitialProps method of our custom Document class to extract the critical CSS on the server.
We also inject a style tag to inline the critical styles for every server response.`,
    singleFileSearch: paths.document(),
    transform(ast: ASTNode, b: builders, t: NamedTypes) {
      const documentContextImport = b.importDeclaration(
        [b.importSpecifier(b.identifier("DocumentContext"))],
        b.literal("blitz"),
      )

      const extractCriticalImport = b.importDeclaration(
        [b.importSpecifier(b.identifier("extractCritical"))],
        b.literal("emotion-server"),
      )

      const ctxParam = b.identifier("ctx")
      ctxParam.typeAnnotation = b.tsTypeAnnotation(
        b.tsTypeReference(b.identifier("DocumentContext")),
      )

      const getInitialPropsBody = b.blockStatement([
        b.variableDeclaration("const", [
          b.variableDeclarator(
            b.identifier("initialProps"),
            b.awaitExpression(
              b.callExpression(
                b.memberExpression(b.identifier("Document"), b.identifier("getInitialProps")),
                [b.identifier("ctx")],
              ),
            ),
          ),
        ]),
        b.variableDeclaration("const", [
          b.variableDeclarator(
            b.identifier("styles"),
            b.callExpression(b.identifier("extractCritical"), [
              b.memberExpression(b.identifier("initialProps"), b.identifier("html")),
            ]),
          ),
        ]),
        b.returnStatement(
          b.objectExpression([
            b.spreadElement(b.identifier("initialProps")),
            b.property(
              "init",
              b.identifier("styles"),
              // TODO: this should be b.jsxFragment(b.jsxOpeningFragment(), b.jsxClosingFragment(), [
              // but it errors: Cannot read property 'selfClosing' of undefined
              // @see https://github.com/facebook/jscodeshift/issues/368
              b.jsxElement(
                b.jsxOpeningElement(b.jsxIdentifier("")),
                b.jsxClosingElement(b.jsxIdentifier("")),
                [
                  b.literal("\n          "),
                  b.jsxExpressionContainer(
                    b.memberExpression(b.identifier("initialProps"), b.identifier("styles")),
                  ),
                  b.literal("\n          "),
                  b.jsxElement(
                    b.jsxOpeningElement(
                      b.jsxIdentifier("style"),
                      [
                        b.jsxAttribute(
                          b.jsxIdentifier("data-emotion-css"),
                          b.jsxExpressionContainer(
                            b.callExpression(
                              b.memberExpression(
                                b.memberExpression(b.identifier("styles"), b.identifier("ids")),
                                b.identifier("join"),
                              ),
                              [b.literal(" ")],
                            ),
                          ),
                        ),
                        b.jsxAttribute(
                          b.jsxIdentifier("dangerouslySetInnerHTML"),
                          b.jsxExpressionContainer(
                            b.objectExpression([
                              b.property(
                                "init",
                                b.identifier("__html"),
                                b.memberExpression(b.identifier("styles"), b.identifier("css")),
                              ),
                            ]),
                          ),
                        ),
                      ],
                      true,
                    ),
                  ),
                  b.literal("\n        "),
                ],
              ),
            ),
          ]),
        ),
      ])

      const getInitialPropsFuncExpr = b.functionExpression(null, [ctxParam], getInitialPropsBody)
      getInitialPropsFuncExpr.async = true

      const getInitialPropsMethod = b.methodDefinition(
        "method",
        b.identifier("getInitialProps"),
        getInitialPropsFuncExpr,
        true, // static
      )

      if (t.File.check(ast)) {
        addImport(ast, b, t, documentContextImport)
        addImport(ast, b, t, extractCriticalImport)
        return addMethodToCustomDocument(ast, b, t, getInitialPropsMethod)!
      }
      throw new Error("Not given valid source file")
    },
  })
  .build()
