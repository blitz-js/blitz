import {SessionContext} from "blitz"

export default async function logout(_?: any, ctx: {session?: SessionContext} = {}) {
  return await ctx.session!.revoke()
}
