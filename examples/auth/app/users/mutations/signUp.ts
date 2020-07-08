import db from "db"
import {SessionContext} from "blitz"
import {hashPassword} from "app/auth"
import * as s from "superstruct"

export const SignUpInput = s.masked(
  s.object({
    email: s.pattern(s.string(), /.+@.+\..+/),
    password: s.length(s.string(), 10, 100),
  }),
)

export default async function signUp(
  input: s.StructType<typeof SignUpInput>,
  ctx: {session?: SessionContext} = {},
) {
  // This throws an error if input is invalid
  const {email, password} = s.coerce(input, SignUpInput)
  const hashedPassword = await hashPassword(password)
  const user = await db.user.create({data: {email, hashedPassword, role: "user"}})

  await ctx.session.create({userId: user.id, roles: [user.role]})

  return user
}
