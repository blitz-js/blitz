import { resolver, SecurePassword, hash256 } from "blitz"
import db from "db"
import login from "./login"

import { ConfirmEmail } from "../validations"

export class ResetPasswordError extends Error {
  name = "ConfirmEmailError"
  message = "Email confirmation link is invalid or it has expired."
}

export default resolver.pipe(resolver.zod(ConfirmEmail), async ({ token }, ctx) => {
  // 1. Try to find this token in the database
  const hashedToken = hash256(token)
  const possibleToken = await db.token.findFirst({
    where: { hashedToken, type: "CONFIRM_EMAIL" },
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

  // 5. Since token is valid, we can verify the user
  await db.user.update({
    where: { id: savedToken.userId },
    data: { verified: true },
  })

  return true
})
