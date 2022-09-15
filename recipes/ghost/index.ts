import {addBlitzMiddleware, addImport, paths, RecipeBuilder} from "blitz/installer"
import j from "jscodeshift"
import path from "path"

export default RecipeBuilder()
  .setName("Ghost")
  .setDescription("Access your Ghost CMS directly in blitz via the Ghost SDK.")
  .setOwner("Mark Hughes <m@rkhugh.es>")
  .setRepoLink("https://github.com/blitz-js/legacy-framework")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "Add npm dependencies",
    explanation: `@tryghost/content-api needs to be installed`,
    packages: [
      {name: "@tryghost/content-api", version: "1.x"},
      {name: "@types/tryghost__content-api", version: "1.x", isDevDep: true},
    ],
  })
  .addTransformFilesStep({
    stepId: "ghostEnv",
    stepName: 'Add default environment variables to blitz"',
    explanation: "Add your real variables into your .env.local file.",
    singleFileSearch: ".env",
    transformPlain(env: string) {
      return (
        env +
        "\n# Ghost environment variables, add your real variables into your .env.local file\n" +
        "GHOST_URL=" +
        "\n" +
        "GHOST_KEY=" +
        "\n"
      )
    },
  })
  .addNewFilesStep({
    stepId: "addIntegration",
    stepName: "Add ghost integration file",
    explanation: "Add integration file for ghost.",
    targetDirectory: "integrations",
    templatePath: path.join(__dirname, "templates", "integrations"),
    templateValues: {},
  })
  .addNewFilesStep({
    stepId: "addDefaultFiles",
    stepName: "Add default files",
    explanation: "Create default files to show usage of ghost in blitz.",
    targetDirectory: "app",
    templatePath: path.join(__dirname, "templates", "app"),
    templateValues: {},
  })
  .addNewFilesStep({
    stepId: "addDefaultPages",
    stepName: "Add default pages",
    explanation: "Create default pages to show usage of ghost in blitz.",
    targetDirectory: "pages",
    templatePath: path.join(__dirname, "templates", "pages"),
    templateValues: {},
  })
  .addTransformFilesStep({
    stepId: "ghostMiddleware",
    stepName: "Add default middleware to expose ghost",
    explanation: "Adds ghostapi to middleware so we can expose it in queries and mutations.",
    singleFileSearch: paths.blitzServer(),
    transform(program) {
      // // import ghostApi from integrations/ghost
      const cssBaselineImport = j.importDeclaration(
        [j.importSpecifier(j.identifier("ghostApi"))],
        j.literal("integrations/ghost"),
      )

      addImport(program, cssBaselineImport)

      // This is the middleware we want to add
      const ghostApiMiddleware = j.arrowFunctionExpression(
        [j.identifier("_"), j.identifier("res"), j.identifier("next")],
        j.blockStatement([
          j.expressionStatement(
            j.assignmentExpression(
              "=",
              j.memberExpression(j.identifier("res"), j.identifier("blitzCtx.ghostApi")),
              j.identifier("ghostApi"),
            ),
          ),
          j.returnStatement(j.callExpression(j.identifier("next"), [])),
        ]),
      )

      // Add our middleware
      addBlitzMiddleware(program, ghostApiMiddleware)

      // and.. return!
      return program
    },
  })
  .build()
