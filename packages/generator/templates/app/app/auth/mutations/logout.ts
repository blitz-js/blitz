import { Ctx } from "blitz"

export default async function logout(_: any, { session }: Ctx) {
  return await session.revoke()
}
