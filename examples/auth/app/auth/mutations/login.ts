import {Ctx} from "blitz"
import {authenticateUser} from "app/auth/auth-utils"
import * as z from "zod"

export const LoginInput = z.object({
  email: z.string().email(),
  password: z.string(),
})
export type LoginInputType = z.infer<typeof LoginInput>

export default async function login(input: LoginInputType, {session}: Ctx) {
  // This throws an error if input is invalid
  const {email, password} = LoginInput.parse(input)

  // This throws an error if credentials are invalid
  const user = await authenticateUser(email, password)

  await session.create({userId: user.id, roles: [user.role]})

  return user
}
