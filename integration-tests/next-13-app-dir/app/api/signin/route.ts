import {api} from "../../../src/blitz-server"
import prisma from "../../../db/index"
import {SecurePassword} from "@blitzjs/auth/secure-password"
import {Role} from "../../../types"
import {getSession} from "@blitzjs/auth"

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

export const GET = async (request: Request, context) => {
  const ctx = await getSession({
    req: request,
  })

  const user = await authenticateUser(
    context.params.email as string,
    context.params.password as string,
  )

  await ctx.session.$create({
    userId: user.id,
    role: user.role as Role,
  })

  const response = new Response(
    JSON.stringify({email: context.params.email, userId: ctx.session.userId}),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  )

  ;(ctx.session as any).setSession(response)

  return response
}
