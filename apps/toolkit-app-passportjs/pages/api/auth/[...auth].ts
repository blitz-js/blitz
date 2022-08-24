import { passportAuth } from "@blitzjs/auth"
import { api } from "app/blitz-server"
import db, { User } from "db"
import { Issuer, Strategy as OpenIdStrategy } from "openid-client"

// OAuth Mock Server
// https://github.com/axa-group/oauth2-mock-server

const issuer = new Issuer({
  issuer: "http://localhost:8080",
  authorization_endpoint: "http://localhost:8080/authorize",
  token_endpoint: "http://localhost:8080/token",
  userinfo_endpoint: "http://localhost:8080/userinfo",
  jwks_uri: "http://localhost:8080/jwks",
})

const client1 = new issuer.Client({
  client_id: "client_id1",
  client_secret: "client_secret1",
  redirect_uris: ["http://localhost:3000/api/auth/mock1/callback"],
})

const client2 = new issuer.Client({
  client_id: "client_id2",
  client_secret: "client_secret2",
  redirect_uris: ["http://localhost:3000/api/auth/mock2/callback"],
})

const client3 = new issuer.Client({
  client_id: "client_id3",
  client_secret: "client_secret3",
  redirect_uris: ["http://localhost:3000/api/auth/localhost/callback"],
})

export default api(
  passportAuth({
    successRedirectUrl: "/",
    errorRedirectUrl: "/",
    strategies: [
      {
        name: "mock1",
        strategy: new OpenIdStrategy(
          { client: client1 },
          // Available callback parameters
          // https://github.com/panva/node-openid-client/blob/main/docs/README.md#strategy
          async (_token, profile, done) => {
            let user: User
            try {
              user = await db.user.findFirstOrThrow({ where: { name: { equals: "user1" } } })
            } catch (e) {
              user = await db.user.create({
                data: {
                  email: "dummy1@email.com",
                  name: "user1",
                  role: "USER",
                },
              })
            }

            const publicData = {
              userId: user.id,
              roles: [user.role],
              source: "mock_client1",
            }
            done(undefined, { publicData })
          }
        ),
      },
      {
        name: "mock2",
        strategy: new OpenIdStrategy(
          { client: client2 },
          // Available callback parameters
          // https://github.com/panva/node-openid-client/blob/main/docs/README.md#strategy
          async (_token, profile, done) => {
            let user: User
            try {
              user = await db.user.findFirstOrThrow({ where: { name: { equals: "user2" } } })
            } catch (e) {
              user = await db.user.create({
                data: {
                  email: "dummy2@email.com",
                  name: "user2",
                  role: "USER",
                },
              })
            }

            const publicData = {
              userId: user.id,
              roles: [user.role],
              source: "mock_client2",
            }
            done(undefined, { publicData })
          }
        ),
      },
      {
        // name is not set, it will use the issuer hostname
        // which is in this example just `localhost`
        strategy: new OpenIdStrategy(
          { client: client3 },
          // Available callback parameters
          // https://github.com/panva/node-openid-client/blob/main/docs/README.md#strategy
          async (_token, profile, done) => {
            let user: User
            try {
              user = await db.user.findFirstOrThrow({ where: { name: { equals: "user3" } } })
            } catch (e) {
              user = await db.user.create({
                data: {
                  email: "dummy3@email.com",
                  name: "user3",
                  role: "USER",
                },
              })
            }

            const publicData = {
              userId: user.id,
              roles: [user.role],
              source: "mock_client3",
            }
            done(undefined, { publicData })
          }
        ),
      },
    ],
  })
)
