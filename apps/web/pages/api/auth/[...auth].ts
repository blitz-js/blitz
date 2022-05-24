import {passportAuth} from "@blitzjs/auth"
import {api} from "app/blitz-server"
import db from "db"
import {Strategy as TwitterStrategy} from "passport-twitter"

export default api(
  passportAuth({
    successRedirectUrl: "/",
    errorRedirectUrl: "/",
    strategies: [
      {
        strategy: new TwitterStrategy(
          {
            consumerKey: process.env.TWITTER_CONSUMER_KEY as string,
            consumerSecret: process.env.TWITTER_CONSUMER_SECRET as string,
            accessTokenURL: "https://api.twitter.com/oauth/access_token",
            callbackURL: "http://127.0.0.1:3000/api/auth/twitter/callback",
            includeEmail: true,
          },
          async function (_token, _tokenSecret, profile, done) {
            const email = profile.emails?.[0]?.value ?? "blitz@test.com"

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
              source: "twitter",
            }

            done(undefined, {publicData})
          },
        ),
      },
    ],
  }),
)
