import {withBlitzAuth} from "../../../src/blitz-server"

export const POST = withBlitzAuth(async (request: Request) => {
  return new Response(null, {status: 200})
})

export const HEAD = withBlitzAuth(async (request: Request) => {
  return new Response(null, {status: 200})
})
