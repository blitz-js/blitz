import {addImport, paths, RecipeBuilder} from "@blitzjs/installer"
import j from "jscodeshift"
import {Collection} from "jscodeshift/src/Collection"
import {join} from "path"

export default RecipeBuilder()
  .setName("Bulma CSS")
  .setDescription(`This will install all necessary dependencies and configure Bulma for use.`)
  .setOwner("vivek7405@hey.com")
  .setRepoLink("https://github.com/blitz-js/blitz")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "npm dependencies",
    explanation: `Bulma CSS requires a couple of dependencies including sass for converting sass and scss to css`,
    packages: [
      {name: "bulma", version: "latest", isDevDep: true},
      {name: "sass", version: "latest", isDevDep: true},
    ],
  })
  .addNewFilesStep({
    stepId: "addStyles",
    stepName: "Stylesheet",
    explanation: `Adds a root CSS stylesheet where Bulma is imported and where you can add global styles`,
    targetDirectory: "./app/core/styles",
    templatePath: join(__dirname, "templates", "styles"),
    templateValues: {},
  })
  .addTransformFilesStep({
    stepId: "importStyles",
    stepName: "Import stylesheets",
    explanation: `Imports the stylesheet we just added into your app`,
    singleFileSearch: paths.app(),
    transform(program: Collection<j.Program>) {
      const stylesImport = j.importDeclaration([], j.literal("app/core/styles/index.scss"))
      return addImport(program, stylesImport)
    },
  })
  .build()
