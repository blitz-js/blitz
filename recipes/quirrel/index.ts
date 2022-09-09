import {paths, RecipeBuilder} from "blitz/installer"
import path from "path"

export default RecipeBuilder()
  .setName("Quirrel")
  .setDescription("Configure Quirrel locally and set it up for use.")
  .setOwner("Simon Knott <info@quirrel.dev>")
  .setRepoLink("https://quirrel.dev")
  .addAddDependenciesStep({
    stepId: "addQuirrelDep",
    stepName: "Install Quirrel",
    explanation:
      "Installs the Quirrel NPM package and concurrently (useful for starting Quirrel together with Blitz).",
    packages: [
      {name: "quirrel", version: "1.x"},
      {name: "concurrently", version: "6.x", isDevDep: true},
    ],
  })
  .addTransformFilesStep({
    stepId: "startWithBlitz",
    stepName: 'Start Quirrel with "blitz dev"',
    explanation: "Make sure that your local Quirrel server runs when you need it.",
    singleFileSearch: paths.packageJson(),
    transformPlain(program) {
      return program.replace(/("dev":\s*")(.*)(")/, (_fullMatch, start, command: string, end) => {
        if (command.includes("concurrently")) {
          command += ` 'quirrel'`
        } else {
          command = `concurrently --raw \\"${command}\\" 'quirrel'`
        }

        return [start, command, end].join("")
      })
    },
  })
  .addNewFilesStep({
    stepId: "addExamples",
    stepName: "Add example files",
    explanation: "Create one example Queue and CronJob that illustrate Quirrel usage.",
    targetDirectory: "app",
    templatePath: path.join(__dirname, "templates", "app"),
    templateValues: {},
  })
  .build()
