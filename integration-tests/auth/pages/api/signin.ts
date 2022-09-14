import {api} from "../../app/blitz-server"
import prisma from "../../db/index"
import {SecurePassword} from "@blitzjs/auth"
import {Role} from "../../types"

export const authenticateUser = async (email: string, password: string) => {
  const user = await prisma.user.findFirst({where: {email}})

  if (!user) throw new Error("Authentication Error")

  const result = await SecurePassword.verify(user.hashedPassword, password)

  if (result === SecurePassword.VALID_NEEDS_REHASH) {
    // Upgrade hashed password with a more secure hash
    const improvedHash = await SecurePassword.hash(password)
    await prisma.user.update({where: {id: user.id}, data: {hashedPassword: improvedHash}})
  }

  const {hashedPassword, ...rest} = user
  return rest
}

export default api(async (req, res, ctx) => {
  const blitzContext = ctx

  const user = await authenticateUser(req.query.email as string, req.query.password as string)

  await blitzContext.session.$create({
    userId: user.id,
    role: user.role as Role,
  })

  res.status(200).json({email: req.query.email, userId: blitzContext.session.userId})
})
