import {addImport, paths, RecipeBuilder} from "@blitzjs/installer"
import j from "jscodeshift"
import {Collection} from "jscodeshift/src/Collection"
import {join} from "path"

export default RecipeBuilder()
  .setName("Secure Headers")
  .setDescription(
    `Improve the security of your blitz app at the push of a button. You will probably have to manually adjust your content security policies to suit your needs.`,
  )
  .setOwner("jeremy@jeremyliberman.com")
  .setRepoLink("https://github.com/blitz-js/blitz")
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
    transform(program: Collection<j.Program>) {
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
              ...path.node.children
                .filter((path) => {
                  return !(
                    path.type === "JSXElement" &&
                    path.openingElement.name.type === "JSXIdentifier" &&
                    path.openingElement.name.name === "meta" &&
                    path.openingElement.attributes.some(
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
    singleFileSearch: paths.blitzConfig(),
    transform(program: Collection<j.Program>) {
      return addHttpHeaders(program, [
        {name: "Strict-Transport-Security", value: "max-age=631138519"},
        {name: "X-Frame-Options", value: "sameorigin"},
        {name: "X-Content-Type-Options", value: "nosniff"},
        {name: "Permissions-Policy", value: "default 'none'"},
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

function findModuleExportsExpressions(program: Collection<j.Program>) {
  return program
    .find(j.AssignmentExpression)
    .filter(
      (path) =>
        path.value.left.type === "MemberExpression" &&
        (path.value.left.object as any).name === "module" &&
        (path.value.left.property as any).name === "exports" &&
        path.value.right.type === "ObjectExpression",
    )
}

function addHttpHeaders(
  program: Collection<j.Program>,
  headers: Array<{name: string; value: string}>,
) {
  findModuleExportsExpressions(program).forEach((moduleExportsExpression) => {
    const config = j(moduleExportsExpression.value.right)

    const arr = j.arrayExpression(
      headers.map(({name, value}) =>
        j.objectExpression([
          j.objectProperty(j.identifier("key"), j.stringLiteral(name)),
          j.objectProperty(j.identifier("value"), j.stringLiteral(value)),
        ]),
      ),
    )

    const obj = moduleExportsExpression.value.right as j.ObjectExpression
    const poweredByProp = config
      .find(j.ObjectProperty)
      .filter(
        (path) =>
          path.value.type === "ObjectProperty" &&
          path.value.key.type === "Identifier" &&
          path.value.key.name === "poweredByHeader",
      )

    if (poweredByProp.length > 0) {
      poweredByProp.forEach((path) => (path.value.value = j.booleanLiteral(false)))
    } else {
      obj.properties.push(
        j.objectProperty(j.identifier("poweredByHeader"), j.booleanLiteral(false)),
      )
    }

    const headersCollection = config
      .find(j.ObjectProperty)
      .filter(
        (path) =>
          path.value.type === "ObjectProperty" &&
          path.value.key.type === "Identifier" &&
          path.value.key.name === "headers",
      )

    if (headersCollection.length > 0) {
      headersCollection.forEach((path) => (path.value.value = arr))
    } else {
      obj.properties.push(j.objectProperty(j.identifier("headers"), arr))
    }
  })

  return program
}
