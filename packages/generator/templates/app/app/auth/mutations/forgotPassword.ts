import { SessionContext } from "blitz"
import db from "db"
import { forgotPasswordMailer } from "mailers/forgotPasswordMailer"
import { ForgotPasswordInput, ForgotPasswordInputType } from "../validations"
import {
  generateToken,
  hashToken,
  RESET_PASSSWORD_TOKEN_EXPIRATION_IN_HOURS,
} from "app/auth/auth-utils"

export default async function forgotPassword(
  input: ForgotPasswordInputType,
  _ctx: { session?: SessionContext } = {}
) {
  const { email } = ForgotPasswordInput.parse(input)

  // 1. Get the user
  const user = await db.user.findOne({ where: { email: email.toLowerCase() } })

  // 2. Generate the token and expiration date.
  // We use encodeURIComponent(token) since it will be used in the URL
  const token = generateToken()
  const urlSafeToken = encodeURIComponent(token)
  const hashedToken = hashToken(token)
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + RESET_PASSSWORD_TOKEN_EXPIRATION_IN_HOURS)

  // 3. If user with this email was found
  if (user) {
    // 4. Delete any existing password reset tokens
    await db.token.deleteMany({ where: { type: "RESET_PASSSWORD", userId: user.id } })
    // 5. Save this new token in the database.
    await db.token.create({
      data: {
        user: { connect: { id: user.id } },
        type: "RESET_PASSSWORD",
        expiresAt,
        hashedToken,
        sentTo: user.email,
      },
    })
    // 6. Send the email
    await forgotPasswordMailer({ to: user.email, token: urlSafeToken }).send()
  } else {
    // 7. If no user found wait the same time so attackers can't tell the difference
    await new Promise((resolve) => setTimeout(resolve, 750))
  }

  // 8. Return the same result whether a password reset email was sent or not
  return
}
