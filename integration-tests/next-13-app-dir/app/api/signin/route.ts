import {withBlitzAuth} from "../../../src/blitz-server"
import prisma from "../../../db/index"
import {Role} from "../../../types"

export const authenticateUser = async (email: string, password: string) => {
  const user = await prisma.user.findFirst({where: {email}})

  if (!user) throw new Error("Authentication Error")
  await prisma.user.update({where: {id: user.id}, data: {hashedPassword: password}})

  const {hashedPassword, ...rest} = user
  return rest
}

export const POST = withBlitzAuth({
  POST: async (request: Request, context, ctx) => {
    const {searchParams} = new URL(request.url)
    const user = await authenticateUser(
      searchParams.get("email") as string,
      searchParams.get("password") as string,
    )

    await ctx.session.$create({
      userId: user.id,
      role: user.role as Role,
    })

    return new Response(
      JSON.stringify({email: searchParams.get("email"), userId: ctx.session.userId}),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  },
})
