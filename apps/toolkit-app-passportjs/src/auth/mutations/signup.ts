import db from "db"
import { SecurePassword } from "@blitzjs/auth/secure-password"
import { Roles } from "types"

export default async function signup(input, ctx) {
  const blitzContext = ctx

  const hashedPassword = await SecurePassword.hash((input.password as string) || "test-password")
  const email = (input.email as string) || "test" + Math.random() + "@test.com"
  const user = await db.user.create({
    data: { email, hashedPassword, roles: "user" },
    select: { id: true, name: true, email: true, roles: true },
  })

  await blitzContext.session.$create({
    userId: user.id,
    roles: user.roles as Roles,
  })

  return { userId: blitzContext.session.userId, ...user, email: input.email }
}
