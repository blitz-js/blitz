import {addImport, paths, RecipeBuilder} from "@blitzjs/installer"
import j from "jscodeshift"
import {Collection} from "jscodeshift/src/Collection"
import {join} from "path"

export default RecipeBuilder()
  .setName("Tailwind CSS")
  .setDescription(
    `Configure your Blitz app's styling with Tailwind CSS. This recipe will install all necessary dependencies and configure Tailwind for immediate use.`,
  )
  .setOwner("adam@markon.codes")
  .setRepoLink("https://github.com/blitz-js/blitz")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "Add npm dependencies",
    explanation: `Tailwind CSS requires a couple of dependencies to get up and running.
We'll install the Tailwind library itself, as well as PostCSS for removing unused styles from our production bundles.`,
packages: [
  {name: "tailwindcss", version: "latest", isDevDep: true},
  {name: "postcss", version: "latest", isDevDep: true},
  {name: "postcss-flexbugs-fixes", version: "latest", isDevDep: true},
  {name: "postcss-preset-env", version: "latest", isDevDep: true},
],
  })
  .addNewFilesStep({
    stepId: "addStyles",
    stepName: "Add base Tailwind CSS styles",
    explanation: `Next, we need to actually create some stylesheets! These stylesheets can either be modified to include global styles for your app, or you can stick to just using classnames in your components.`,
    targetDirectory: "./app",
    templatePath: join(__dirname, "templates", "styles"),
    templateValues: {},
  })
  .addTransformFilesStep({
    stepId: "importStyles",
    stepName: "Import stylesheets",
    explanation: `Finaly, we can import the stylesheets we just created into our application. For now we'll put them in document.tsx, but if you'd like to only style a part of your app with tailwind you could import the styles lower down in your component tree.`,
    singleFileSearch: paths.app(),
    transform(program: Collection<j.Program>) {
      const stylesImport = j.importDeclaration([], j.literal("tailwindcss/tailwind.css"))
      return addImport(program, stylesImport)
    },
  })
  .build()
