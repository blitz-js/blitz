import {paths, RecipeBuilder} from "@blitzjs/installer"

export default RecipeBuilder()
  .setName("Quirrel")
  .setDescription("Configure Quirrel locally and set it up for immediate use.")
  .setOwner("Simon Knott <info@quirrel.dev>")
  .setRepoLink("https://quirrel.dev")
  .addAddDependenciesStep({
    stepId: "addQuirrelDep",
    stepName: "Install Quirrel",
    explanation:
      "Installs the Quirrel NPM package and concurrently (useful for starting Quirrel together with Blitz).",
    packages: [
      {
        name: "quirrel",
        version: "latest",
      },
      {
        name: "concurrently",
        version: "latest",
        isDevDep: true,
      },
    ],
  })
  .addTransformFilesStep({
    stepId: "startWithBlitz",
    stepName: 'Start Quirrel with "blitz start"',
    explanation: "Make sure that your local Quirrel server runs when you need it.",
    singleFileSearch: paths.packageJson(),
    transformPlain(program) {
      return program.replace(/("start":\s*")(.*)(")/, (_fullMatch, start, command: string, end) => {
        if (command.includes("concurrently")) {
          command += ` 'quirrel'`
        } else {
          command = `concurrently --raw '${command}' 'quirrel'`
        }

        return [start, command, end].join("")
      })
    },
  })
  .build()
