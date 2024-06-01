import {withBlitzAuth} from "../../../src/blitz-server"

export const POST = withBlitzAuth(async (_request, _params, ctx) => {
  const session = ctx.session
  await session.$revoke()

  return new Response(
    JSON.stringify({
      userId: session.userId,
    }),
    {status: 200},
  )
})
