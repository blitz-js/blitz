import { SessionContext } from "blitz"
import db from "db"
import { ResetPasswordInput, ResetPasswordInputType } from "../validations"
import { hashToken, hashPassword } from "../auth-utils"

export class ResetPasswordError extends Error {
  name = "ResetPasswordError"
  message = "Reset password link is invalid or it has expired."
}

export default async function resetPassword(
  input: ResetPasswordInputType,
  _ctx: { session?: SessionContext } = {}
) {
  const { password, token } = ResetPasswordInput.parse(input)

  // 1. Try to find this token in the database
  // Have to first decodeURIComponent(token) because encodeURIComponent
  // was used in forgotPassword.ts when sending to the browser
  const hashedToken = hashToken(decodeURIComponent(token))
  const possibleToken = await db.token.findFirst({
    where: { hashedToken, type: "RESET_PASSSWORD" },
    include: { user: true },
  })

  // 2. If token not found, error
  if (!possibleToken) {
    throw new ResetPasswordError()
  }
  const savedToken = possibleToken

  // 3. Delete token so it can't be used again
  await db.token.delete({ where: { id: savedToken.id } })

  // 4. If token has expired, error
  if (savedToken.expiresAt < new Date()) {
    throw new ResetPasswordError()
  }

  // 5. Since token is valid, now we can update the user's password
  const hashedPassword = await hashPassword(password)
  const user = await db.user.update({
    where: { id: savedToken.userId },
    data: { hashedPassword },
  })

  // 6. Revoke all existing login sessions for this user
  await db.session.deleteMany({ where: { userId: user.id } })

  return true
}
