import {SessionContext} from "blitz"
import {authenticateUser} from "app/auth"
import * as z from "zod"

export const LoginInput = z.object({
  email: z.string(),
  password: z.string(),
})

export default async function login(
  input: z.infer<typeof LoginInput>,
  ctx: {session?: SessionContext} = {},
) {
  // This throws an error if input is invalid
  const {email, password} = LoginInput.parse(input)

  // This throws an error if credentials are invalid
  const user = await authenticateUser(email, password)

  await ctx.session!.create({userId: user.id, roles: [user.role]})

  return user
}
