import { protect } from "blitz"
import { authenticateUser } from "app/auth/auth-utils"
import { LoginInput } from "../validations"

export default protect({ schema: LoginInput, authorize: false }, async function login(
  { email, password },
  { session }
) {
  // This throws an error if credentials are invalid
  const user = await authenticateUser(email, password)

  await session.create({ userId: user.id, roles: [user.role] })

  return user
})
