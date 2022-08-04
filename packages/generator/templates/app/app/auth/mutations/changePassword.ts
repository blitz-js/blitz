import { NotFoundError, AuthenticationError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import { SecurePassword } from "@blitzjs/auth"
import db from "db"
import { authenticateUser } from "./login"
import { ChangePassword } from "../validations"

export default resolver.pipe(
  resolver.zod(ChangePassword),
  resolver.authorize(),
  async ({ currentPassword, newPassword }, ctx) => {
    const user = await db.user.findFirst({ where: { id: ctx.session.userId as number } })
    if (!user) throw new NotFoundError()

   try {
      await authenticateUser(user.email, currentPassword)
    } catch (error: any) {
      if (error instanceof AuthenticationError) {
        throw new Error("Invalid Password")
      }
      throw error
    }

    const hashedPassword = await SecurePassword.hash(newPassword.trim())
    await db.user.update({
      where: { id: user.id },
      data: { hashedPassword },
    })

    return true
  }
)
