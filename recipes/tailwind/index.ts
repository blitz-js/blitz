import {addImport, paths, RecipeBuilder} from "blitz/installer"
import j from "jscodeshift"
import {join} from "path"
import fs from "fs"
import path from "path"

function ext(jsx = false) {
  return fs.existsSync(path.resolve("tsconfig.json")) ? (jsx ? ".tsx" : ".ts") : ".js"
}

function isUsingAppRouter() {
  // Check if using the NextJS app router
  // The root layout file is always present in the app directory
  const appRouterLayoutFile = `${paths.appSrcDirectory()}/layout${ext(true)}`
  const appRouterLayoutFileExists = fs.existsSync(path.resolve(appRouterLayoutFile))

  if (appRouterLayoutFileExists) {
    return true
  } else {
    return false
  }
}

export default RecipeBuilder()
  .setName("Tailwind CSS")
  .setDescription(`This will install all necessary dependencies and configure Tailwind for use.`)
  .setOwner("adam@markon.codes")
  .setRepoLink("https://github.com/blitz-js/blitz/")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "npm dependencies",
    explanation: `Tailwind CSS requires a couple of dependencies including PostCSS for removing unused styles from the production bundle`,
    packages: [
      {name: "tailwindcss", version: "3.x", isDevDep: true},
      {name: "autoprefixer", version: "10.x", isDevDep: true},
      {name: "postcss", version: "8.x", isDevDep: true},
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
    targetDirectory: isUsingAppRouter()
      ? `./${paths.appSrcDirectory()}`
      : `./${paths.appSrcDirectory()}/core`,
    templatePath: isUsingAppRouter()
      ? join(__dirname, "next")
      : join(__dirname, "templates", "styles"),
    templateValues: {},
  })
  .addTransformFilesStep({
    stepId: "importStyles",
    stepName: "Import stylesheets",
    explanation: `Imports the stylesheet we just added into your app`,
    singleFileSearch: paths.app(),
    transform(program) {
      if (isUsingAppRouter()) {
        const stylesImport = j.importDeclaration(
          [],
          j.literal(`${paths.appSrcDirectory()}globals.css`),
        )
        addImport(program, stylesImport)
      }

      const stylesImport = j.importDeclaration(
        [],
        j.literal(`${paths.appSrcDirectory()}/core/styles/index.css`),
      )
      return addImport(program, stylesImport)
    },
  })
  .build()
