/* NOTE: Run these commands:
 *
 * npx prisma generate
 * blitz dev
 *
 * then visit http://localhost:3000/api/graphql to view
 * the graphql playground. Try registering a new User account and then querying
 * for it with the following query:
 *
 * query {
 *   allUsers {
 *     id
 *     email
 *     role
 *   }
 * }
 */

import {getSession} from "@blitzjs/auth"
import {makeSchema} from "nexus"
import {ApolloServer} from "apollo-server-micro"
import * as types from "../types"

export const schema = makeSchema({
  types,
  outputs: {
    schema: __dirname + "/../schema.graphql",
    typegen: __dirname + "/generated/nexus.ts",
  },
  sourceTypes: {
    modules: [
      {
        module: "@prisma/client",
        alias: "prisma",
      },
    ],
  },
})
const apolloServer = new ApolloServer({
  schema,
  context: ({req, res}) => getSession(req, res),
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default apolloServer.createHandler({path: "/api/graphql"})
