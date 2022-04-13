import { NotFoundError, Ctx } from "blitz"
import { prisma } from "db"
import { authenticateUser } from "./login"
import { ChangePassword } from "../validations"
import { SecurePassword } from "@blitzjs/auth"

export default async function changePassword(input, ctx: Ctx) {
  ChangePassword.parse(input)
  ctx.session.$isAuthorized()

  const user = await prisma.user.findFirst({
    where: {
      id: ctx.session.userId as number,
    },
  })

  if (!user) throw new NotFoundError()
  await authenticateUser(user.email, input.currentPassword)

  const hashedPassword = await SecurePassword.hash(input.newPassword.trim())

  await prisma.user.update({
    where: { id: user.id },
    data: { hashedPassword },
  })
}
