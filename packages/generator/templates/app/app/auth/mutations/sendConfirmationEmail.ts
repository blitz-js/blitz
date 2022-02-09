import { resolver, generateToken, hash256, Ctx } from "blitz"
import db from "db"
import { confirmEmailMailer } from "mailers/confirmEmailMailer"

const CONFIRM_EMAIL_TOKEN_EXPIRATION_IN_HOURS = 24

export default resolver.pipe(async ({ ...data }, ctx: Ctx) => {
  ctx.session.$authorize()

  // 1. Get the user
  const user = await db.user.findFirst({ where: { id: ctx.session.userId } })

  // 2. Generate the token and expiration date.
  const token = generateToken()
  const hashedToken = hash256(token)
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + CONFIRM_EMAIL_TOKEN_EXPIRATION_IN_HOURS)

  // 3. If user with this email was found
  if (user) {
    // 4. Delete any existing email confirmation tokens
    await db.token.deleteMany({ where: { type: "CONFIRM_EMAIL", userId: user.id } })
    // 5. Save this new token in the database.
    await db.token.create({
      data: {
        userId: user.id,
        type: "CONFIRM_EMAIL",
        expiresAt,
        hashedToken,
        sentTo: user.email,
      },
    })
    // 6. Send the email
    await confirmEmailMailer({ to: user.email, token }).send()
  } else {
    // 7. If no user found wait the same time so attackers can't tell the difference
    await new Promise((resolve) => setTimeout(resolve, 750))
  }

  // 8. Return the same result whether a email reset email was sent or not
  return
})
