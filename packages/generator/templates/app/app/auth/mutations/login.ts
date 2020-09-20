import { SessionContext } from "blitz"
import { authenticateUser, buildPublicData } from "app/auth/auth-utils"
import { LoginInput, LoginInputType } from "../validations"

export default async function login(input: LoginInputType, ctx: { session?: SessionContext } = {}) {
  // This throws an error if input is invalid
  const { email, password } = LoginInput.parse(input)

  // This throws an error if credentials are invalid
  const user = await authenticateUser(email, password)

  await ctx.session!.create(
    buildPublicData({
      userId: user.id,
      role: user.role,
    })
  )

  return user
}
