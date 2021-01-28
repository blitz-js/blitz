import { NotFoundError, SecurePassword, pipe } from "blitz"
import db from "db"
import { authenticateUser } from "./login"
import { ChangePassword } from "../validations"

export default pipe.resolver(
  pipe.zod(ChangePassword),
  pipe.authorize(),
  async ({ currentPassword, newPassword }, ctx) => {
    const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
    if (!user) throw new NotFoundError()
    await authenticateUser(user.email, currentPassword)

    const hashedPassword = await SecurePassword.hash(newPassword)
    await db.user.update({
      where: { id: user.id },
      data: { hashedPassword },
    })

    return true
  }
)
