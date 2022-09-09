import {addImport, paths, RecipeBuilder} from "blitz/installer"
import j from "jscodeshift"
import {join} from "path"

export default RecipeBuilder()
  .setName("LogRocket")
  .setDescription(`This will install all necessary dependencies and configure LogRocket for use.`)
  .setOwner("Kevin Langley Jr. <me@kevinlangleyjr.com>")
  .setRepoLink("https://github.com/blitz-js/legacy-framework")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "Add dependencies",
    explanation: `Add 'logrocket' and 'logrocket-react' as dependencies.`,
    packages: [
      {name: "logrocket", version: "2.x"},
      {name: "logrocket-react", version: "4.x"},
    ],
  })
  .addNewFilesStep({
    stepId: "addIntegrationsFile",
    stepName: "Add LogRocket integration file",
    explanation: `Next, we need to add an integration file that contains helpers for LogRocket.`,
    targetDirectory: "./integrations",
    templatePath: join(__dirname, "templates", "integrations"),
    templateValues: {},
  })
  .addTransformFilesStep({
    stepId: "add",
    stepName: "Import helpers and log user upon login",
    explanation: `We will add logic to initialize the LogRocket session and upon login, identify the user within LogRocket`,
    singleFileSearch: paths.app(),
    transform(program) {
      // Ensure useSession is in the blitz imports.
      program.find(j.ImportDeclaration, {source: {value: "blitz"}}).forEach((blitzImportPath) => {
        let specifiers = blitzImportPath.value.specifiers || []
        if (
          !specifiers
            .filter((spec) => j.ImportSpecifier.check(spec))
            .some((node) => (node as j.ImportSpecifier)?.imported?.name === "useSession")
        ) {
          specifiers.splice(0, 0, j.importSpecifier(j.identifier("useSession")))
        }
      })

      const logrocketImport = j.importDeclaration(
        [j.importDefaultSpecifier(j.identifier("* as LogRocket"))],
        j.literal("integrations/logrocket"),
      )

      addImport(program, logrocketImport)

      let isReactImported = false

      // Ensure useEffect is in the react import.
      program.find(j.ImportDeclaration, {source: "react"}).forEach((path) => {
        // check if React is already imported
        // if yes then we can skip importing it
        // since we need it for useEffect
        isReactImported = true

        // currently, we only check if the default export is there
        // because we use the hook as React.useEffect
        // if not then add the default export
        let specifiers = path.value.specifiers || []

        if (!specifiers.some((node) => j.ImportDefaultSpecifier.check(node))) {
          specifiers.splice(0, 0, j.importDefaultSpecifier(j.identifier("React")))
        }
      })

      // import React if it wasn't already imported
      if (!isReactImported) {
        const reactImport = j.importDeclaration(
          [j.importDefaultSpecifier(j.identifier("React"))],
          j.literal("react"),
        )
        addImport(program, reactImport)
      }

      const isSessionDeclared = program.findVariableDeclarators("session")

      program.find(j.FunctionDeclaration, {id: {name: "App"}}).forEach((path) => {
        // Declare router and/or session if not declared.
        if (!isSessionDeclared.length) {
          path
            .get("body")
            .get("body")
            .value.unshift(
              j.variableDeclaration("const", [
                j.variableDeclarator(
                  j.identifier("session"),
                  j.callExpression(j.identifier("useSession"), [
                    j.objectExpression([
                      j.objectProperty(j.identifier("suspense"), j.booleanLiteral(false)),
                    ]),
                  ]),
                ),
              ]),
            )
        }
      })

      const returnStm = program.find(j.ReturnStatement).filter((path) => {
        return (
          path.parent?.parent?.parent?.value?.declaration?.id?.name === "App" &&
          path.parent?.parent?.parent?.value?.type === j.ExportDefaultDeclaration.toString()
        )
      })

      if (returnStm) {
        returnStm.insertBefore(
          j.expressionStatement(
            j.callExpression(j.memberExpression(j.identifier("React"), j.identifier("useEffect")), [
              j.arrowFunctionExpression(
                [],
                j.blockStatement([
                  j.ifStatement(
                    j.memberExpression(j.identifier("session"), j.identifier("userId")),
                    j.blockStatement([
                      j.expressionStatement(
                        j.callExpression(
                          j.memberExpression(j.identifier("LogRocket"), j.identifier("identify")),
                          [
                            j.callExpression(
                              j.memberExpression(
                                j.identifier("session.userId"),
                                j.identifier("toString"),
                              ),
                              [],
                            ),
                          ],
                        ),
                      ),
                    ]),
                  ),
                ]),
              ),
              j.arrayExpression([j.identifier("session")]),
            ]),
          ),
        )
      }

      program.find(j.ExportDefaultDeclaration).forEach((path) => {
        const logrocketInit = j.expressionStatement(
          j.callExpression(j.memberExpression(j.identifier("LogRocket"), j.identifier("init")), []),
        )

        path.insertBefore(logrocketInit)
      })

      return program
    },
  })
  .build()
