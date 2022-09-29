import {addImport, paths, Program, RecipeBuilder, transformNextConfig} from "blitz/installer"
import j from "jscodeshift"
import {join} from "path"

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

export default RecipeBuilder()
  .setName("vanilla-extract")
  .setDescription(
    `This will install all necessary dependencies and configure vanilla-extract for use.`,
  )
  .setOwner("JuanM04 <me@juanm04.com>")
  .setRepoLink("https://github.com/blitz-js/legacy-framework")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "Add dependencies",
    explanation: `Add vanilla-extract and its Next.js plugin`,
    packages: [
      {name: "@vanilla-extract/css", version: "^1"},
      {name: "@vanilla-extract/babel-plugin", version: "^1"},
      {name: "@vanilla-extract/next-plugin", version: "^1"},
    ],
  })
  .addNewFilesStep({
    stepId: "addConfig",
    stepName: "Add the '@vanilla-extract/babel-plugin' plugin to the babel config file",
    explanation: `Now we have to update our babel config to support vanilla-extract`,
    targetDirectory: ".",
    templatePath: join(__dirname, "templates", "config"),
    templateValues: {},
  })
  .addTransformFilesStep({
    stepId: "modifyBlitzConfig",
    stepName: "Add the '@vanilla-extract/next-plugin' plugin to the blitz config file",
    explanation: `Now we have to update our blitz config to support vanilla-extract`,
    singleFileSearch: paths.nextConfig(),
    async transform(program) {
      program = initializePlugin(
        program,
        j.variableDeclaration("const", [
          j.variableDeclarator(
            j.identifier("withVanillaExtract"),
            j.callExpression(j.identifier("createVanillaExtractPlugin"), []),
          ),
        ]),
      )
      transformNextConfig(program).addRequireStatement(
        "createVanillaExtractPlugin",
        "@vanilla-extract/next-plugin",
      )
      transformNextConfig(program).wrapConfig("withVanillaExtract")
      return program
    },
  })
  .build()
