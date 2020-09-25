import {Ctx} from "blitz"

export default async function logout(_ = null, {session}: Ctx) {
  return await session.revoke()
}
