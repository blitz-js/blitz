const { sessionMiddleware, simpleRolesIsAuthorized } = require("@blitzjs/server")
const { GraphQLClient, gql } = require("graphql-request")

const graphQLClient = new GraphQLClient("https://graphql.fauna.com/graphql", {
  headers: {
    authorization: "Bearer " + process.env.FAUNA_SECRET,
  },
})

const normalizeSession = (faunaSession) => {
  if (!faunaSession) return null
  const { user, expiresAt, ...rest } = faunaSession
  return {
    ...rest,
    userId: user.id,
    expiresAt: new Date(expiresAt),
  }
}

module.exports = {
  middleware: [
    sessionMiddleware({
      isAuthorized: simpleRolesIsAuthorized,
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
        if (!session) return null
        const { user, expiresAt, ...rest } = session
        return {
          ...rest,
          userId: user.id,
          expiresAt: new Date(expiresAt),
        }
      },
      // getSessions: (userId) => getDb().session.findMany({ where: { userId } }),
      createSession: async (session) => {
        const { userId, ...sessionInput } = session
        const userInput = { connect: userId }

        const { createSession: sessionRes } = await graphQLClient.request(
          gql`
            mutation CreateSession($data: SessionInput!) {
              createSession(data: $data) {
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
          {
            data: {
              ...sessionInput,
              expiresAt: sessionInput.expiresAt.toISOString(),
              user: userInput,
            },
          }
        )
        return normalizeSession(sessionRes)
      },
      updateSession: async (sessionHandle, session) => {
        const { findSessionByHandle: existingSession } = await graphQLClient.request(
          gql`
            query getSession($handle: String!) {
              findSessionByHandle(handle: $handle) {
                id: _id
              }
            }
          `,
          { handle: sessionHandle }
        )

        const { userId, handle, ...sessionInput } = session

        const { updateSession: sessionRes } = await graphQLClient.request(
          gql`
            mutation UpdateSession($data: SessionInput!) {
              updateSession(data: $data) {
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
          {
            data: {
              ...sessionInput,
              id: existingSession.id,
              expiresAt: sessionInput.expiresAt.toISOString(),
            },
          }
        )
        return normalizeSession(sessionRes)
      },
      deleteSession: async (handle) => {
        const { findSessionByHandle: existingSession } = await graphQLClient.request(
          gql`
            query getSession($handle: String!) {
              findSessionByHandle(handle: $handle) {
                id: _id
              }
            }
          `,
          { handle: handle }
        )

        await graphQLClient.request(
          gql`
            mutation DeleteSession($id ID!) {
              deleteSession(id: $id) {
                id: _id
                handle
              }
            }
          `,
          {
            id: existingSession.id,
          }
        )
      },
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
