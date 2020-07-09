import {AuthenticationError} from "blitz"
import SecurePassword from "secure-password"
import db, {User} from "db"

const SP = new SecurePassword()

export const hashPassword = async (password: string) => {
  const hashedBuffer = SP.hash(Buffer.from(password))
  return hashedBuffer.toString()
}

export const authorizeUser = async (email: string, password: string) => {
  const user = await db.user.findOne({where: {email}})

  if (!user) throw new AuthenticationError()

  switch (await SP.verify(Buffer.from(password), Buffer.from(user.hashedPassword))) {
    case SecurePassword.VALID:
      break
    case SecurePassword.VALID_NEEDS_REHASH:
      // Upgrade hashed password with a more secure hash
      const improvedHash = await hashPassword(password)
      await db.user.update({where: {id: user.id}, data: {hashedPassword: improvedHash}})
      break
    default:
      throw new AuthenticationError()
  }

  delete user.hashedPassword
  return user as Omit<User, "hashedPassword">
}
