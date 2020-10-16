const { sessionMiddleware, unstable_simpleRolesIsAuthorized } = require("@blitzjs/server")
const { GraphQLClient, gql } = require("graphql-request")

const graphQLClient = new GraphQLClient("https://graphql.fauna.com/graphql", {
  headers: {
    authorization: "Bearer " + process.env.FAUNA_SECRET,
  },
})

module.exports = {
  middleware: [
    sessionMiddleware({
      unstable_isAuthorized: unstable_simpleRolesIsAuthorized,
      getSession: async (handle) => {
        const { findSessionByHandle: session } = await graphQLClient.request(
          gql`
            query getSession($handle: String!) {
              findSessionByHandle(handle: $handle) {
                id: _id
                publicData
                privateData
                antiCSRFToken
                expiresAt
                hashedSessionToken
                handle
                user {
                  id: _id
                }
              }
            }
          `,
          { handle: handle }
        )
        console.log(session)
        const { user, ...rest } = session
        return {
          ...rest,
          userId: user.id,
        }
      },
      getSessions: (userId) => getDb().session.findMany({ where: { userId } }),
      createSession: (session) => {
        let user
        if (session.userId) {
          user = { connect: { id: session.userId } }
        }
        return getDb().session.create({
          data: { ...session, userId: undefined, user },
        })
      },
      updateSession: async (handle, session) => {
        try {
          return await getDb().session.update({ where: { handle }, data: session })
        } catch (error) {
          // Session doesn't exist in DB for some reason, so create it
          if (error.code === "P2016") {
            log.warning("Could not update session because it's not in the DB")
          } else {
            throw error
          }
        }
      },
      deleteSession: (handle) => getDb().session.delete({ where: { handle } }),
    }),
  ],
  /* Uncomment this to customize the webpack config
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    // Important: return the modified config
    return config
  },
  */
}
