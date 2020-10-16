import { GraphQLClient } from "graphql-request"

const graphQLClient = new GraphQLClient("https://graphql.fauna.com/graphql", {
  headers: {
    authorization: "Bearer " + process.env.FAUNA_SECRET,
  },
})

// Because of bug: https://github.com/blitz-js/blitz/issues/1331
export const connect = () => {}

export default graphQLClient
