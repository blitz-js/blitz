import {RecipeBuilder} from "@blitzjs/installer"
import {join} from "path"

export default RecipeBuilder()
  .setName("Phusion Passenger")
  .setDescription("")
  .setOwner("peter.nyari@ioflair.com")
  .setRepoLink("https://github.com/blitz-js/blitz")
  .addNewFilesStep({
    stepId: "addPassengerEntrypoint",
    stepName: "Add passenger.js",
    explanation: `NOTE: Passenger must be configured to use passenger.js as its startup file`,
    targetDirectory: ".",
    templatePath: join(__dirname, "templates"),
    templateValues: {},
  })
  .build()
