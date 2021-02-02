import {resolver, SecurePassword, AuthenticationError} from "blitz"
import db from "db"
// import {logger} from "utils/logger"
import * as z from "zod"

export const authenticateUser = async (email: string, password: string) => {
  const user = await db.user.findFirst({where: {email}})
  if (!user) throw new AuthenticationError()

  const result = await SecurePassword.verify(user.hashedPassword, password)

  if (result === SecurePassword.VALID_NEEDS_REHASH) {
    // Upgrade hashed password with a more secure hash
    const improvedHash = await SecurePassword.hash(password)
    await db.user.update({where: {id: user.id}, data: {hashedPassword: improvedHash}})
  }

  const {hashedPassword, ...rest} = user
  return rest
}

export const LoginInput = z.object({
  email: z.string().email(),
  password: z.string(),
})

export default resolver.pipe(resolver.zod(LoginInput), async ({email, password}, {session}) => {
  // logger.debug("Starting login...")
  // This throws an error if credentials are invalid
  const user = await authenticateUser(email, password)
  // logger.debug("Authenticated user", {user})

  await session.$create({userId: user.id, roles: [user.role]})

  return user
})
