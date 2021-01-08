import { Ctx } from "blitz"
import db from "db"
import { hashPassword } from "app/auth/auth-utils"
import { SignupInput, SignupInputType } from "app/auth/validations"

export default async function signup(input: SignupInputType, { session }: Ctx) {
  // This throws an error if input is invalid
  const { email, password } = SignupInput.parse(input)

  const hashedPassword = await hashPassword(password)
  const user = await db.user.create({
    data: { email: email.toLowerCase(), hashedPassword, role: "user" },
    select: { id: true, name: true, email: true, role: true },
  })

  await session.create({ userId: user.id, roles: [user.role] })

  return user
}
