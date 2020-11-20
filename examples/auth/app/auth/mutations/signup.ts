import {Ctx} from "blitz"
import db from "db"
import {hashPassword} from "app/auth/auth-utils"
import * as z from "zod"

export const SignupInput = z.object({
  email: z.string().email(),
  password: z.string().min(10).max(100),
})
export type SignupInputType = z.infer<typeof SignupInput>

export default async function signup(input: SignupInputType, {session}: Ctx) {
  // This throws an error if input is invalid
  const {email, password} = SignupInput.parse(input)

  const hashedPassword = await hashPassword(password)
  const user = await db.user.create({
    data: {email, hashedPassword, role: "user"},
    select: {id: true, name: true, email: true, role: true},
  })

  await session.create({userId: user.id, roles: [user.role]})

  return user
}
