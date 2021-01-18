import { Ctx, NotFoundError, SecurePassword } from "blitz"
import db from "db"
import { authenticateUser } from "./login"
import { ChangePasswordInput, ChangePasswordInputType } from "../validations"

export default async function updatePassword(input: ChangePasswordInputType, ctx: Ctx) {
  ctx.session.authorize()
  const { currentPassword, newPassword } = ChangePasswordInput.parse(input)

  const user = await db.user.findFirst({ where: { id: ctx.session.userId } })
  if (!user) throw new NotFoundError()
  await authenticateUser(user.email, currentPassword)

  const hashedPassword = await SecurePassword.hash(newPassword)
  await db.user.update({
    where: { id: user.id },
    data: { hashedPassword },
  })

  return true
}
