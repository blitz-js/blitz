import { pipe, SecurePassword } from "blitz"
import db from "db"
import { Signup } from "app/auth/validations"

export default pipe.resolver(pipe.zod(Signup), async ({ email, password }, ctx) => {
  const hashedPassword = await SecurePassword.hash(password)
  const user = await db.user.create({
    data: { email: email.toLowerCase(), hashedPassword, role: "user" },
    select: { id: true, name: true, email: true, role: true },
  })

  await ctx.session.$create({ userId: user.id, roles: [user.role] })
  return user
})
