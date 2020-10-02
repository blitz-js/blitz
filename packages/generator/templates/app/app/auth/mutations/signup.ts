import { protect } from "blitz"
import db from "db"
import { hashPassword } from "app/auth/auth-utils"
import { SignupInput } from "app/auth/validations"

export default protect({ schema: SignupInput, authorize: false }, async function signup(
  { email, password },
  { session }
) {
  const hashedPassword = await hashPassword(password)
  const user = await db.user.create({
    data: { email: email.toLowerCase(), hashedPassword, role: "user" },
    select: { id: true, name: true, email: true, role: true },
  })

  await session.create({ userId: user.id, roles: [user.role] })

  return user
})
