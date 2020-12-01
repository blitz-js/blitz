import {passportAuth} from "blitz"
import db from "db"
import {Strategy as TwitterStrategy} from "passport-twitter"
import {Strategy as GitHubStrategy} from "passport-github2"
import {Strategy as Auth0Strategy} from "passport-auth0"

function assert(condition: any, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

// These aren't required, but this is a good practice to ensure you have the env vars you need
assert(process.env.TWITTER_CONSUMER_KEY, "You must provide the TWITTER_CONSUMER_KEY env variable")
assert(
  process.env.TWITTER_CONSUMER_SECRET,
  "You must provide the TWITTER_CONSUMER_SECRET env variable",
)
assert(process.env.GITHUB_CLIENT_ID, "You must provide the GITHUB_CLIENT_ID env variable")
assert(process.env.GITHUB_CLIENT_SECRET, "You must provide the GITHUB_CLIENT_SECRET env variable")

assert(process.env.AUTH0_DOMAIN, "You must provide the AUTH0_DOMAIN env variable")
assert(process.env.AUTH0_CLIENT_ID, "You must provide the AUTH0_CLIENT_ID env variable")
assert(process.env.AUTH0_CLIENT_SECRET, "You must provide the AUTH0_CLIENT_SECRET env variable")

export default passportAuth({
  successRedirectUrl: "/",
  strategies: [
    {
      strategy: new TwitterStrategy(
        {
          consumerKey: process.env.TWITTER_CONSUMER_KEY,
          consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
          callbackURL:
            process.env.NODE_ENV === "production"
              ? "https://auth-example-flybayer.blitzjs.vercel.app/api/auth/twitter/callback"
              : "http://localhost:3000/api/auth/twitter/callback",
          includeEmail: true,
        },
        async function (_token, _tokenSecret, profile, done) {
          const email = profile.emails && profile.emails[0]?.value

          if (!email) {
            // This can happen if you haven't enabled email access in your twitter app permissions
            return done(new Error("Twitter OAuth response doesn't have email."))
          }

          const user = await db.user.upsert({
            where: {email},
            create: {
              email,
              name: profile.displayName,
            },
            update: {email},
          })

          const publicData = {userId: user.id, roles: [user.role], source: "twitter"}
          done(null, {publicData})
        },
      ),
    },
    {
      strategy: new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL:
            process.env.NODE_ENV === "production"
              ? "https://auth-example-flybayer.blitzjs.vercel.app/api/auth/github/callback"
              : "http://localhost:3000/api/auth/github/callback",
        },
        async function (_token, _tokenSecret, profile, done) {
          const email = profile.emails && profile.emails[0]?.value

          if (!email) {
            // This can happen if you haven't enabled email access in your twitter app permissions
            return done(new Error("Twitter OAuth response doesn't have email."))
          }

          const user = await db.user.upsert({
            where: {email},
            create: {
              email,
              name: profile.displayName,
            },
            update: {email},
          })

          const publicData = {
            userId: user.id,
            roles: [user.role],
            source: "github",
            githubUsername: profile.username,
          }
          done(null, {publicData})
        },
      ),
    },
    {
      authenticateOptions: {scope: "openid email profile"},
      strategy: new Auth0Strategy(
        {
          domain: process.env.AUTH0_DOMAIN,
          clientID: process.env.AUTH0_CLIENT_ID,
          clientSecret: process.env.AUTH0_CLIENT_SECRET,
          callbackURL:
            process.env.NODE_ENV === "production"
              ? "https://auth-example-flybayer.blitzjs.vercel.app/api/auth/auth0/callback"
              : "http://localhost:3000/api/auth/auth0/callback",
        },
        async function (_token, _tokenSecret, extraParams, profile, done) {
          const email = profile.emails && profile.emails[0]?.value

          if (!email) {
            // This can happen if you haven't enabled email access in your twitter app permissions
            return done(new Error("Auth0 response doesn't have email."))
          }

          const user = await db.user.upsert({
            where: {email},
            create: {
              email,
              name: profile.displayName,
            },
            update: {email},
          })

          const publicData = {
            userId: user.id,
            roles: [user.role],
            source: "auth0",
            githubUsername: profile.username,
          }
          done(undefined, {publicData})
        },
      ),
    },
  ],
})
