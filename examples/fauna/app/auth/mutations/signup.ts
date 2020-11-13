import { Ctx } from "blitz"
import db from "db"
import { hashPassword } from "app/auth/auth-utils"
import { SignupInput, SignupInputType } from "app/auth/validations"
import { gql } from "graphql-request"

export default async function signup(input: SignupInputType, { session }: Ctx) {
  // This throws an error if input is invalid
  const { email, password } = SignupInput.parse(input)

  const hashedPassword = await hashPassword(password)
  const { user } = await db.request(
    gql`
      mutation createUser($email: String!, $hashedPassword: String, $role: String!) {
        user: createUser(data: { email: $email, hashedPassword: $hashedPassword, role: $role }) {
          id: _id
          email
          name
          role
        }
      }
    `,
    { email: email.toLowerCase(), hashedPassword, role: "user" }
  )
  console.log("Create user result:", user)

  await session.create({ userId: user.id, roles: [user.role] })

  return user
}
