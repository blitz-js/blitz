import {Ctx} from "blitz"
import db from "db"
import {hashPassword} from "app/auth/auth-utils"
import {SignupInput} from "app/auth/validations"

export default async function signup(input: unknown, {session}: Ctx) {
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
