import {addPrismaGenerator, paths, RecipeBuilder} from "blitz/installer"
import {join} from "path"

export default RecipeBuilder()
  .setName("GraphQL Apollo Server")
  .setDescription(
    `Implements a GraphQL API using Apollo Server that you can extend with your prisma models.`,
  )
  .setOwner("jeremy@jeremyliberman.com")
  .setRepoLink("https://github.com/blitz-js/legacy-framework")
  .addAddDependenciesStep({
    stepId: "addDeps",
    stepName: "Add dependencies",
    explanation: `Add dependencies for defining and handling a GraphQL endpoint.`,
    packages: [
      {name: "apollo-server-micro", version: "3.x"},
      {name: "graphql", version: "15.x"},
      {name: "nexus", version: "1.x"},
      {name: "nexus-prisma", version: "0.34.x"},
    ],
  })
  .addNewFilesStep({
    stepId: "addGraphqlApi",
    stepName: "Add GraphQL module",
    explanation: `Add some GraphQL types and a route to serve the GraphQL API from.`,
    targetDirectory: "./app/graphql",
    templatePath: join(__dirname, "templates", "graphql"),
    templateValues: {},
  })
  .addTransformFilesStep({
    stepId: "updatePrismaSchema",
    stepName: "Add generator to schema.prisma",
    explanation: "Adds the nexus-prisma generator to your schema.prisma file",
    singleFileSearch: paths.prismaSchema(),
    transformPlain: (program: string) =>
      addPrismaGenerator(program, {
        type: "generator",
        name: "nexusPrisma",
        assignments: [{type: "assignment", key: "provider", value: '"nexus-prisma"'}],
      }),
  })
  .printMessage({
    stepId: "manualStep",
    stepName: "Informs the user about a manual step: `blitz prisma generate`",
    message:
      "Please run `blitz prisma generate` in your console/terminal to generate the graphql schema.",
  })
  .build()
