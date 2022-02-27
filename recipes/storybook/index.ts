import {addImport, paths, RecipeBuilder} from "@blitzjs/installer"
import j from "jscodeshift"
import {join} from "path"

export default RecipeBuilder()
  .setName("Storybook")
  .setDescription(`This will install all necessary dependencies and configure Storybook for use.`)
  .setOwner("Roewyn Umayam <roewyn.e.umayam@gmail.com>")
  .setRepoLink("https://github.com/blitz-js/blitz")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "npm dependencies",
    explanation: `Storybook requires a couple of dependencies to run. These include the Storybook essentials and ie11 addons.`,
    packages: [
      {name: "@storybook/addon-essentials", version: "6.5.0-alpha.39", isDevDep: true},
      {name: "@storybook/addon-ie11", version: "0.0.7--canary.5e87b64.0", isDevDep: true},
      {name: "@storybook/addons", version: "6.5.0-alpha.39", isDevDep: true},
      {name: "@storybook/builder-webpack4", version: "6.5.0-alpha.39", isDevDep: true},
      {name: "@storybook/preset-create-react-app", version: "^3.1.6", isDevDep: true},
      {name: "@storybook/react", version: "6.5.0-alpha.39", isDevDep: true},
      {name: "webpack", version: "4", isDevDep: true},
    ],
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
    targetDirectory: "./app/core/components",
    templatePath: join(__dirname, "templates", "stories"),
    templateValues: {},
  })
  .build()
