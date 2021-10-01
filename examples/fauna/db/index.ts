import { GraphQLClient } from "graphql-request"

const graphQLClient = new GraphQLClient(process.env.FAUNA_GRAPHQL_URL, {
  headers: {
    authorization: "Bearer " + process.env.FAUNA_SECRET,
  },
})

export default graphQLClient
