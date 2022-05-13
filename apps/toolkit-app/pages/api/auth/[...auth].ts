import { passportAuth } from "@blitzjs/auth"
import { db } from "db"
import MockStrategy from "passport-mock-strategy"

export default passportAuth({
  successRedirectUrl: "/",
  errorRedirectUrl: "/",
  strategies: [
    {
      strategy: new MockStrategy(
        {
          user: {
            emails: [{ value: "ola@test.com", type: "" }],
            name: { familyName: "test", givenName: "" },
            id: "1",
            provider: "Twitter",
          },
        },
        async function (profile, done) {
          console.log({ profile, done })
          const email = profile.emails ? profile.emails[0]?.value : "test@example.com"

          if (!email) {
            // This can happen if you haven't enabled email access in your twitter app permissions
            return done(new Error("Mock OAuth response doesn't have email."))
          }

          const user = await db.user.upsert({
            where: { email },
            create: {
              email,
              name: profile.displayName ?? "Aleksandra",
            },
            update: { email },
          })
          console.log({ user })

          const publicData = {
            userId: user.id,
            roles: user.roles,
            source: "Twitter",
          }
          done(undefined, { user })
        }
      ),
    },
  ],
})
