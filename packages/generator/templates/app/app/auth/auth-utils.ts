import { AuthenticationError } from "blitz"
import SecurePassword from "secure-password"
import hasha, { HashaInput } from "hasha"
import { nanoid } from "nanoid"
import db from "db"

const SP = new SecurePassword()

export const RESET_PASSSWORD_TOKEN_EXPIRATION_IN_HOURS = 4

export const hashPassword = async (password: string) => {
  const hashedBuffer = await SP.hash(Buffer.from(password))
  return hashedBuffer.toString("base64")
}
export const verifyPassword = async (hashedPassword: string, password: string) => {
  try {
    return await SP.verify(Buffer.from(password), Buffer.from(hashedPassword, "base64"))
  } catch (error) {
    console.error(error)
    return false
  }
}

export const generateToken = () => nanoid(32)
export const hashToken = (input: HashaInput) => hasha(input, { algorithm: "sha256" })

export const authenticateUser = async (email: string, password: string) => {
  const user = await db.user.findOne({ where: { email } })

  if (!user || !user.hashedPassword) throw new AuthenticationError()

  switch (await verifyPassword(user.hashedPassword, password)) {
    case SecurePassword.VALID:
      break
    case SecurePassword.VALID_NEEDS_REHASH:
      // Upgrade hashed password with a more secure hash
      const improvedHash = await hashPassword(password)
      await db.user.update({ where: { id: user.id }, data: { hashedPassword: improvedHash } })
      break
    default:
      throw new AuthenticationError()
  }

  const { hashedPassword, ...rest } = user
  return rest
}

type PublicData = {
  userId: number
  role: string
}

/*
 * This is a nice utility function for ensuring that you set the session
 * public data exactly the same way on signup and login.
 */
export const buildPublicData = ({ userId, role }: PublicData) => {
  return { userId, roles: [role] }
}
