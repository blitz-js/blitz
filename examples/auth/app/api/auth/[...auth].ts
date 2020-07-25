import {
  BlitzApiRequest,
  BlitzApiResponse,
  handleRequestWithMiddleware,
  connectMiddleware,
  Middleware,
  SessionContext,
} from "blitz"
import passport, {Strategy} from "passport"
import {Strategy as TwitterStrategy} from "passport-twitter"
import {Strategy as GitHubStrategy} from "passport-github2"
import cookieSession from "cookie-session"
import db from "db"

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

export default passportAuth({
  successRedirectUrl: "/",
  strategies: [
    new TwitterStrategy(
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
        done(null, publicData)
      },
    ),
    new GitHubStrategy(
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
        done(null, publicData)
      },
    ),
  ],
})

type BlitzPassportConfig = {
  // TODO - support function that receives publicData
  successRedirectUrl?: string
  errorRedirectUrl?: string
  strategies: Required<Strategy>[]
}

function passportAuth(config: BlitzPassportConfig) {
  return async function authHandler(req: BlitzApiRequest, res: BlitzApiResponse) {
    const middleware: Middleware[] = [
      connectMiddleware(
        cookieSession({
          secret: process.env.SESSION_SECRET_KEY || "default-dev-secret",
          secure: process.env.NODE_ENV === "production",
        }),
      ),
      connectMiddleware(passport.initialize()),
      connectMiddleware(passport.session()),
    ]

    if (!req.query.auth.length) {
      return res.status(404).end()
    }

    assert(
      config.strategies.length,
      "No Passport strategies found! Please add at least one strategy.",
    )

    const strategy = config.strategies.find((strategy) => strategy.name === req.query.auth[0])
    assert(strategy, `A passport strategy was not found for: ${req.query.auth[0]}`)

    passport.use(strategy)

    if (req.query.auth.length === 1) {
      console.log(`Starting authentication via ${strategy.name}...`)
      middleware.push(connectMiddleware(passport.authenticate(strategy.name)))
    } else if (req.query.auth[1] === "callback") {
      console.log(`Processing callback for ${strategy.name}`)
      middleware.push(
        connectMiddleware((req, res, next) => {
          // TODO fix type
          const session = (res as any).blitzCtx.session as SessionContext
          assert(session, "Missing Blitz sessionMiddleware!")

          passport.authenticate(strategy.name, async (err, user) => {
            if (err) {
              // TODO - redirect back to origin with error
              throw err
            }
            assert(user, `No user found in callback from ${strategy.name}!`)
            await session.create(user)

            res.setHeader("Location", config.successRedirectUrl || "/")
            // TODO fix type
            ;(res as any).status(302).end()
          })(req, res, next)
        }),
      )
    }

    await handleRequestWithMiddleware(req, res, middleware)
  }
}
