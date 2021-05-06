import {addImport, paths, RecipeBuilder} from "@blitzjs/installer"
import chalk from "chalk"
import * as fs from "fs"
import j, {Collection} from "jscodeshift"
import {join} from "path"

const packageDev = JSON.parse(`${fs.readFileSync("./package.json")}`)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isReactFinalForm = packageDev?.dependencies?.["react-final-form"] !== undefined
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isReactHookForm = packageDev?.dependencies?.["react-hook-form"] !== undefined
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isFormik = packageDev?.dependencies?.["formik"] !== undefined

const useForm = isReactFinalForm
  ? "react-final-form"
  : isReactHookForm
  ? "react-hook-form"
  : isFormik
  ? "formik"
  : false

if (!useForm)
  throw new Error(
    chalk.red(
      "Please install one of this package to install this recipe \n1. react-final-form\n2. react-hook-form\n3. formik",
    ),
  )

export default RecipeBuilder()
  .setName("Auth Tail")
  .setDescription("This will install all necessary dependencies and configure Auth Tail for use.")
  .setOwner("anjianto06@gmail.com")
  .setRepoLink("https://github.com/blitz-js/blitz")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "Install dependencies",
    explanation:
      "Auth Tail requires a couple of dependencies including PostCSS for removing unused styles from the production bundle",
    packages: [
      {name: "tailwindcss", version: "2.1.2", isDevDep: true},
      {name: "autoprefixer", version: "10", isDevDep: true},
      {name: "postcss", version: "8", isDevDep: true},
      {name: "@tailwindcss/custom-forms", version: "0.2.1", isDevDep: true},
    ],
  })
  .addNewFilesStep({
    stepId: "addTailwindConfig",
    stepName: "Tailwind Config Files",
    explanation:
      "Adds config files to give you a good starting point and remove .template from filename",
    targetDirectory: ".",
    templatePath: join(__dirname, "templates", "tailwindcss"),
    templateValues: {},
  })
  .addNewFilesStep({
    stepId: "addStyles",
    stepName: "Stylesheet",
    explanation: `Adds a root CSS stylesheet where Tailwind is imported and where you can add global styles and remove .template from folder name`,
    targetDirectory: "./app/core",
    templatePath: join(__dirname, "templates", "styles"),
    templateValues: {},
  })
  .addTransformFilesStep({
    stepId: "importStyles",
    stepName: "Import stylesheets",
    explanation: `Imports the stylesheet we just added into your app`,
    singleFileSearch: paths.app(),
    transform(program: Collection<j.Program>) {
      const stylesImport = j.importDeclaration([], j.literal("app/core/styles/index.css"))
      return addImport(program, stylesImport)
    },
  })
  .addNewFilesStep({
    stepId: "addCoreFile",
    stepName: "Core Files",
    explanation:
      "Adds core files to give you a good development and remove .template from filename",
    targetDirectory: "./app/core/components",
    templatePath: join(__dirname, "templates", "core", useForm),
    templateValues: {},
  })
  .addNewFilesStep({
    stepId: "addAuthFile",
    stepName: "Auth Files",
    explanation:
      "Adds auth files to give you a secure app and remove .template from filename and from folder name",
    targetDirectory: "./app",
    templatePath: join(__dirname, "templates", "auth"),
    templateValues: {},
  })
  .build()

//   Collection<Program> | Promise<Collection<Program>>
