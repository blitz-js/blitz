import {addBabelPlugin, paths, RecipeBuilder} from "@blitzjs/installer"
import j from "jscodeshift"
import {Collection} from "jscodeshift/src/Collection"
import {join} from "path"

export default RecipeBuilder()
  .setName("GraphQL")
  .setDescription(
    `Implements a GraphQL API that you can extend with your prisma models. After installation, run your dev server and visit http://localhost:3000/api/graphql to launch the GraphQL playground!`,
  )
  .setOwner("jeremy@jeremyliberman.com")
  .setRepoLink("https://github.com/blitz-js/blitz")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "Add dependencies",
    explanation: `Add dependencies for defining and handling a GraphQL endpoint.`,
    packages: [
      {name: "@babel/plugin-proposal-decorators", version: "latest"},
      {name: "apollo-server-micro", version: "latest"},
      {name: "graphql", version: "latest"},
      {name: "reflect-metadata", version: "latest"},
      {name: "type-graphql", version: "latest"},
    ],
  })
  .addNewFilesStep({
    stepId: "addGraphqlApi",
    stepName: "Add GraphQL API endpoint",
    explanation: `Add a route to serve the GraphQL API from.`,
    targetDirectory: "./app/graphql/api",
    templatePath: join(__dirname, "templates", "graphql", "api"),
    templateValues: {},
  })
  .addTransformFilesStep({
    stepId: "updateBabelConfig",
    stepName: "Set babel.config.js",
    explanation: `Add the decorators plugin to the babel.config.js`,
    singleFileSearch: paths.babelConfig(),
    transform(program: Collection<j.Program>) {
      return addBabelPlugin(program, ["@babel/plugin-proposal-decorators", {legacy: true}])
    },
  })
  .addTransformFilesStep({
    stepId: "updateTsconfig",
    stepName: "Set experimentalDecorators in tsconfig.json",
    explanation: "Enable decorators",
    singleFileSearch: "tsconfig.json",
    transformPlain(program: string) {
      const json = JSON.parse(program)
      json.compilerOptions.experimentalDecorators = true
      return JSON.stringify(json, null, 2)
    },
  })
  .build()
