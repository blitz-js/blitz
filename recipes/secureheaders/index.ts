import {addImport, paths, Program, RecipeBuilder, transformNextConfig} from "blitz/installer"
import j from "jscodeshift"
import {join} from "path"

export default RecipeBuilder()
  .setName("Secure Headers")
  .setDescription(
    `Improve the security of your blitz app at the push of a button. You will probably have to manually adjust your content security policies to suit your needs.`,
  )
  .setOwner("jeremy@jeremyliberman.com")
  .setRepoLink("https://github.com/blitz-js/legacy-framework")
  .addNewFilesStep({
    stepId: "addSecureHeadersUtils",
    stepName: "Add SecureHeaders util files",
    explanation: `Add a utility file that will help us to generate the hash for our Content Security Policy.`,
    targetDirectory: "./app/core",
    templatePath: join(__dirname, "templates", "core"),
    templateValues: {},
  })
  .addTransformFilesStep({
    stepId: "metaTags",
    stepName: "Set meta tags",
    explanation: `Inserts meta tags into the <head> element of _document.tsx`,
    singleFileSearch: paths.document(),
    transform(program) {
      const secureHeadersImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("computeCsp"))],
        j.literal("app/core/secureheaders"),
      )

      if (
        program
          .find(j.ImportDeclaration)
          .filter((path) => path.node.source.value === secureHeadersImport.source.value).length ===
        0
      ) {
        addImport(program, secureHeadersImport)
      }

      program.findJSXElements("DocumentHead").forEach((path) => {
        path.replace(
          j.jsxElement(
            j.jsxOpeningElement(j.jsxIdentifier("DocumentHead")),
            j.jsxClosingElement(j.jsxIdentifier("DocumentHead")),
            [
              ...addHttpMetaTag(
                "Content-Security-Policy",
                j.jsxExpressionContainer(
                  j.callExpression(j.identifier("computeCsp"), [
                    j.memberExpression(j.thisExpression(), j.identifier("props")),
                  ]),
                ),
              ),
              ...addHttpMetaTag("Referrer-Policy", j.stringLiteral("origin-when-cross-origin")),
              j.literal("\n"),
              ...(path.node.children || [])
                .filter((path) => {
                  return !(
                    path.type === "JSXElement" &&
                    path.openingElement.name.type === "JSXIdentifier" &&
                    path.openingElement.name.name === "meta" &&
                    path.openingElement.attributes?.some(
                      (attr) =>
                        attr.type === "JSXAttribute" &&
                        attr.name.type === "JSXIdentifier" &&
                        attr.name.name === "httpEquiv" &&
                        attr.value?.type === "StringLiteral" &&
                        ["Content-Security-Policy", "Referrer-Policy"].includes(attr.value.value),
                    )
                  )
                })
                .filter(Boolean),
            ],
          ),
        )
      })

      return program
    },
  })
  .addTransformFilesStep({
    stepId: "customHeaders",
    stepName: "Set custom headers",
    explanation: `Insert custom headers into blitz.config.js and disable the "X-Powered-By: Next.js" header`,
    singleFileSearch: paths.nextConfig(),
    transform(program) {
      return addHttpHeaders(program, [
        {name: "Strict-Transport-Security", value: "max-age=631138519; includeSubDomains; preload"},
        {name: "X-Frame-Options", value: "sameorigin"},
        {name: "X-Content-Type-Options", value: "nosniff"},
        {name: "Permissions-Policy", value: "default 'none'"},
        {name: "Content-Security-Policy", value: "frame-ancestors 'self'"},
      ])
    },
  })
  .build()

function addHttpMetaTag(name: string, value: j.JSXExpressionContainer | j.StringLiteral) {
  return [
    j.literal("\n"),
    j.jsxElement(
      j.jsxOpeningElement(
        j.jsxIdentifier("meta"),
        [
          j.jsxAttribute(j.jsxIdentifier("httpEquiv"), j.stringLiteral(name)),
          j.jsxAttribute(j.jsxIdentifier("content"), value),
        ],
        true,
      ),
    ),
  ]
}

const addHttpHeaders = (program: Program, headers: Array<{name: string; value: string}>) => {
  let headersFunction = j.arrowFunctionExpression(
    [],
    j.blockStatement([
      j.returnStatement(
        j.arrayExpression([
          j.objectExpression([
            j.objectProperty(j.identifier("source"), j.stringLiteral("/(.*)")),
            j.objectProperty(
              j.identifier("headers"),
              j.arrayExpression(
                headers.map(({name, value}) =>
                  j.objectExpression([
                    j.objectProperty(j.identifier("key"), j.stringLiteral(name)),
                    j.objectProperty(j.identifier("value"), j.stringLiteral(value)),
                  ]),
                ),
              ),
            ),
          ]),
        ]),
      ),
    ]),
  )
  headersFunction.async = true
  const headersCollection = transformNextConfig(program).configObj.find(
    (value) =>
      value.type === "ObjectProperty" &&
      value.key.type === "Identifier" &&
      value.key.name === "headers",
  ) as j.ObjectProperty | undefined

  if (headersCollection) {
    headersCollection.value = headersFunction
  } else {
    transformNextConfig(program).pushToConfig(
      j.objectProperty(j.identifier("headers"), headersFunction),
    )
  }

  const poweredByProp = transformNextConfig(program).configObj.find(
    (value) =>
      value.type === "ObjectProperty" &&
      value.key.type === "Identifier" &&
      value.key.name === "poweredByHeader",
  ) as j.ObjectProperty | undefined

  if (poweredByProp) {
    poweredByProp.value = j.booleanLiteral(false)
  } else {
    transformNextConfig(program).pushToConfig(
      j.objectProperty(j.identifier("poweredByHeader"), j.booleanLiteral(false)),
    )
  }
  return program
}
