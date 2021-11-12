import {addBabelPlugin, addImport, paths, RecipeBuilder, wrapBlitzConfig} from "@blitzjs/installer"
import j from "jscodeshift"

export default RecipeBuilder()
  .setName("vanilla-extract")
  .setDescription(
    `This will install all necessary dependencies and configure vanilla-extract for use.`,
  )
  .setOwner("JuanM04 <me@juanm04.com>")
  .setRepoLink("https://github.com/blitz-js/blitz")
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
  .addTransformFilesStep({
    stepId: "addBabelPlugin",
    stepName: "Add the '@vanilla-extract/babel-plugin' plugin to the babel config file",
    explanation: `Now we have to update our babel config to support vanilla-extract`,
    singleFileSearch: paths.babelConfig(),
    transform(program) {
      return addBabelPlugin(program, "@vanilla-extract/babel-plugin")
    },
  })
  .addTransformFilesStep({
    stepId: "modifyBlitzConfig",
    stepName: "Add the '@vanilla-extract/next-plugin' plugin to the blitz config file",
    explanation: `Now we have to update our blitz config to support vanilla-extract`,
    singleFileSearch: paths.blitzConfig(),
    transform(program) {
      program = addImport(
        program,
        j.importDeclaration(
          [j.importSpecifier(j.identifier("createVanillaExtractPlugin"))],
          j.literal("@vanilla-extract/next-plugin"),
        ),
      )
      return wrapBlitzConfig(program, "createVanillaExtractPlugin")
    },
  })
  .build()
