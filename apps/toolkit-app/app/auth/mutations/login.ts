import { AuthenticationError } from "blitz"
import { prisma } from "db"
import { Login } from "../validations"
import { SecurePassword } from "@blitzjs/auth"

export const authenticateUser = async (rawEmail: string, rawPassword: string) => {
  const { email, password } = Login.parse({ email: rawEmail, password: rawPassword })
  const user = await prisma.user.findFirst({ where: { email } })
  if (!user) throw new AuthenticationError()

  const result = await SecurePassword.verify(user.hashedPassword, password)

  if (result === SecurePassword.VALID_NEEDS_REHASH) {
    // Upgrade hashed password with a more secure hash
    const improvedHash = await SecurePassword.hash(password)
    await prisma.user.update({ where: { id: user.id }, data: { hashedPassword: improvedHash } })
  }

  const { hashedPassword, ...rest } = user
  return rest
}

export default async function login(input, ctx) {
  const user = await authenticateUser(input.email, input.password)
  await ctx.session.$create({ userId: user.id, role: user.role })

  return user
}
