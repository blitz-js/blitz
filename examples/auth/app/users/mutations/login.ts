import {SessionContext} from "blitz"
import {authorizeUser} from "app/auth"
import * as s from "superstruct"

export const LoginInput = s.masked(
  s.object({
    email: s.string(),
    password: s.string(),
  }),
)

export default async function login(
  input: s.StructType<typeof LoginInput>,
  ctx: {session?: SessionContext} = {},
) {
  // This throws an error if input is invalid
  const {email, password} = s.coerce(input, LoginInput)
  // This throws an error if credentials are invalid
  const user = await authorizeUser(email, password)

  await ctx.session.create({userId: user.id, roles: [user.role]})

  return user
}
