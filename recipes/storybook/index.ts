import {paths, RecipeBuilder} from "@blitzjs/installer"
import {join} from "path"

export default RecipeBuilder()
  .setName("Storybook")
  .setDescription(`This will install all necessary dependencies and configure Storybook for use.`)
  .setOwner("Roewyn Umayam <roewynumayam@yahoo.com>")
  .setRepoLink("https://github.com/blitz-js/blitz")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "npm dependencies",
    explanation: `Storybook requires a couple of dependencies to run. These include the Storybook essentials and ie11 addons.`,
    packages: [
      {name: "@storybook/addon-essentials", version: "6.5.0-alpha.39", isDevDep: true},
      {name: "@storybook/addons", version: "6.5.0-alpha.39", isDevDep: true},
      {name: "@storybook/builder-webpack4", version: "6.5.0-alpha.39", isDevDep: true},
      {name: "@storybook/preset-create-react-app", version: "^3.1.6", isDevDep: true},
      {name: "@storybook/react", version: "6.5.0-alpha.39", isDevDep: true},
      {name: "webpack", version: "4", isDevDep: true},
    ],
  })
  .addTransformFilesStep({
    stepId: "addStorybookScripts",
    stepName: 'Adds Storybook script commands to package.json"',
    explanation:
      "Creates script commands to run or build Storybook found when you create a new Storybook project using npx sb init.",
    singleFileSearch: paths.packageJson(),
    transformPlain(program) {
      return program.replace(
        /(?<start>"scripts": \{)(?<content>[^}]*)(?<end>\})/,
        (_fullMatch, start, content, end) => {
          start += `\n "storybook": "start-storybook -p 6006",
    "build-storybook": "build-storybook",`

          return [start, content, end].join("")
        },
      )
    },
  })
  .addNewFilesStep({
    stepId: "addStorybookConfig",
    stepName: "Add .storybook files",
    explanation: `The a basic main.js and preview.js to get the bare essenstials of Storybook to work`,
    targetDirectory: ".storybook",
    templatePath: join(__dirname, "templates", ".storybook"),
    templateValues: {},
  })
  .addNewFilesStep({
    stepId: "addExampleStories",
    stepName: "Add Example Story Files",
    explanation: `Adds a story file in the .mdx format. Refer to https://storybook.js.org/docs/react/get-started/whats-a-story for more info.`,
    targetDirectory: "./app/stories",
    templatePath: join(__dirname, "templates", "stories"),
    templateValues: {},
  })
  .build()
