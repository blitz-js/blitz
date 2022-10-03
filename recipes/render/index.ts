import {RecipeBuilder} from "blitz/installer"
import {join} from "path"

export default RecipeBuilder()
  .setName("Render.com")
  .setDescription("")
  .setOwner("b@bayer.ws")
  .setRepoLink("https://github.com/blitz-js/legacy-framework")
  .addNewFilesStep({
    stepId: "addRenderConfig",
    stepName: "Add render.yaml",
    explanation: `NOTE: Your app must be configured to use Postgres for this render.yaml config`,
    targetDirectory: ".",
    templatePath: join(__dirname, "templates"),
    templateValues: {},
  })
  .build()
