import { Ctx, SecurePassword, AuthenticationError } from "blitz"
import db from "db"
import { LoginInput, LoginInputType } from "../validations"

export const authenticateUser = async (email: string, password: string) => {
  const user = await db.user.findFirst({ where: { email } })
  if (!user) throw new AuthenticationError()

  const result = await SecurePassword.verify(user.hashedPassword, password)

  if (result === SecurePassword.VALID_NEEDS_REHASH) {
    // Upgrade hashed password with a more secure hash
    const improvedHash = await SecurePassword.hash(password)
    await db.user.update({ where: { id: user.id }, data: { hashedPassword: improvedHash } })
  }

  const { hashedPassword, ...rest } = user
  return rest
}

export default async function login(input: LoginInputType, { session }: Ctx) {
  // This throws an error if input is invalid
  const { email, password } = LoginInput.parse(input)

  // This throws an error if credentials are invalid
  const user = await authenticateUser(email, password)

  await session.create({ userId: user.id, roles: [user.role] })

  return user
}
