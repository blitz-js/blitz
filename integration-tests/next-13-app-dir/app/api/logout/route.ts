import {getSession} from "@blitzjs/auth"

export const GET = async (request: Request) => {
  const ctx = await getSession({
    req: request,
  })
  ctx.session.$revoke()

  const response = new Response(
    JSON.stringify({
      userId: ctx.session.userId,
    }),
    {status: 200},
  )

  ;(ctx.session as any).setSession(response)

  return response
}
