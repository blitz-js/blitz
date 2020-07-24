import {
  BlitzApiRequest,
  BlitzApiResponse,
  handleRequestWithMiddleware,
  connectMiddleware,
  Middleware,
  SessionContext,
} from "blitz"
import passport from "passport"
import {Strategy as TwitterStrategy} from "passport-twitter"
import invariant from "tiny-invariant"
import cookieSession from "cookie-session"
import db from "db"

export default async function authHandler(req: BlitzApiRequest, res: BlitzApiResponse) {
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

  const protocol = process.env.NODE_ENV === "production" ? "https://" : "http://"
  const origin = protocol + req.headers.host
  console.log("Origin:", origin)

  if (req.url?.includes("twitter")) {
    invariant(
      process.env.TWITTER_CONSUMER_KEY,
      "You must provide the TWITTER_CONSUMER_KEY env variable",
    )
    invariant(
      process.env.TWITTER_CONSUMER_SECRET,
      "You must provide the TWITTER_CONSUMER_SECRET env variable",
    )

    console.log("QUERY", req.query)

    const callbackURL = origin + "/api/auth/twitter/callback"

    passport.use(
      new TwitterStrategy(
        {
          consumerKey: process.env.TWITTER_CONSUMER_KEY,
          consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
          callbackURL,
          includeEmail: true,
        },
        async function (token, tokenSecret, profile, done) {
          // console.log("\nCALLBACK", profile)

          const email = profile.emails && profile.emails[0]?.value
          if (!email) {
            return done(
              new Error(
                "The Twitter OAuth response doesn't have an email. Make sure you have enabled email access in your app permissions inside the Twitter developer dashboard",
              ),
            )
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
    )
    if (req.query.auth.length === 1 && req.query.auth[0] === "twitter") {
      console.log("Authenticating via twitter...")
      middleware.push(connectMiddleware(passport.authenticate("twitter")))
    } else if (req.query.auth[0] === "twitter" && req.query.auth[1] === "callback") {
      console.log("Twitter auth callback...")
      middleware.push(
        connectMiddleware((req, res, next) => {
          const session = res.blitzCtx.session as SessionContext
          if (!session) throw new Error("Missing Blitz sessionMiddleware!")

          passport.authenticate("twitter", async (err, user, info) => {
            if (err) {
              // TODO - redirect back to origin with error
              throw err
            }
            if (!user) throw new Error("Twitter OAuth: No user found")

            await session.create(user)
            res.setHeader("Location", `/`)
            res.status(302).end()
          })(req, res, next)
        }),
      )
    }
  } else {
    return res.status(404).end()
  }

  await handleRequestWithMiddleware(req, res, middleware)
}
