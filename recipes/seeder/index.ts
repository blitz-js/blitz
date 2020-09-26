import {RecipeBuilder} from "@blitzjs/installer"
import {join} from "path"

export default RecipeBuilder()
  .setName("Seeder")
  .setDescription("This recipe will add a database seeder system.")
  .setOwner("alex@sandulat.com")
  .setRepoLink("https://github.com/blitz-js/blitz")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "Add npm dependencies",
    explanation: `We will just install faker.js for generating fake data.`,
    packages: [
      {name: "lodash.merge", version: "4.6.2"},
      {name: "faker", version: "5.1.0", isDevDep: true},
      {name: "@types/faker", version: "5.1.2", isDevDep: true},
    ],
  })
  .addNewFilesStep({
    stepId: "addSeeder",
    stepName: "Add the seeder system and an example.",
    explanation: `We are simply copying the seeder system into your app with a simple user seeder example.`,
    targetDirectory: "./seeder",
    templatePath: join(__dirname, "templates"),
    templateValues: {},
  })
  .build()
