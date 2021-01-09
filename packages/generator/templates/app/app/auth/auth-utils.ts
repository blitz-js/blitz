import { SecurePassword, AuthenticationError } from "blitz"
import hasha, { HashaInput } from "hasha"
import { nanoid } from "nanoid"
import db from "db"

export const RESET_PASSWORD_TOKEN_EXPIRATION_IN_HOURS = 4
export const generateToken = () => nanoid(32)
export const hashToken = (input: HashaInput) => hasha(input, { algorithm: "sha256" })

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

