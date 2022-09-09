import {addImport, paths, RecipeBuilder} from "blitz/installer"
import j from "jscodeshift"
import {join} from "path"

export default RecipeBuilder()
  .setName("Tailwind CSS")
  .setDescription(`This will install all necessary dependencies and configure Tailwind for use.`)
  .setOwner("adam@markon.codes")
  .setRepoLink("https://github.com/blitz-js/legacy-framework")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "npm dependencies",
    explanation: `Tailwind CSS requires a couple of dependencies including PostCSS for removing unused styles from the production bundle`,
    packages: [
      {name: "tailwindcss", version: "3.x"},
      {name: "autoprefixer", version: "10.x"},
      {name: "postcss", version: "8.x"},
    ],
  })
  .addNewFilesStep({
    stepId: "addConfig",
    stepName: "Config files",
    explanation: `Adds config files to give you a good starting point`,
    targetDirectory: ".",
    templatePath: join(__dirname, "templates", "config"),
    templateValues: {},
  })
  .addNewFilesStep({
    stepId: "addStyles",
    stepName: "Stylesheet",
    explanation: `Adds a root CSS stylesheet where Tailwind is imported and where you can add global styles`,
    targetDirectory: "./app/core",
    templatePath: join(__dirname, "templates", "styles"),
    templateValues: {},
  })
  .addTransformFilesStep({
    stepId: "importStyles",
    stepName: "Import stylesheets",
    explanation: `Imports the stylesheet we just added into your app`,
    singleFileSearch: paths.app(),
    transform(program) {
      const stylesImport = j.importDeclaration([], j.literal("app/core/styles/index.css"))
      return addImport(program, stylesImport)
    },
  })
  .build()
