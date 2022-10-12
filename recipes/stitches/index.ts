import {RecipeBuilder} from "blitz/installer"
import {join} from "path"

export default RecipeBuilder()
  .setName("Stitches")
  .setDescription(`This will install all necessary dependencies and configure Stitches for use.`)
  .setOwner("xa300600@hotmail.com")
  .setRepoLink("https://github.com/blitz-js/legacy-framework")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "npm dependencies",
    explanation: `Stitches requires one dependencies to use it with react`,
    packages: [{name: "@stitches/react", version: "1.x"}],
  })
  .addNewFilesStep({
    stepId: "addConfig",
    stepName: "Config files",
    explanation: `Adds config files to give you a good starting point`,
    targetDirectory: ".",
    templatePath: join(__dirname, "templates", "config"),
    templateValues: {},
  })
  .build()
