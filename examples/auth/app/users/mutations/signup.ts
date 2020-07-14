import db from "db"
import {SessionContext} from "blitz"
import {hashPassword} from "app/auth"
import * as z from "zod"

export const SignupInput = z.object({
  email: z.string().email(),
  password: z.string().min(10).max(100),
})

export default async function signup(
  input: z.infer<typeof SignupInput>,
  ctx: {session?: SessionContext} = {},
) {
  // This throws an error if input is invalid
  const {email, password} = SignupInput.parse(input)
  const hashedPassword = await hashPassword(password)
  console.log("hashedPassword", hashedPassword)
  const user = await db.user.create({data: {email, hashedPassword, role: "user"}})

  await ctx.session.create({userId: user.id, roles: [user.role]})

  return user
}
