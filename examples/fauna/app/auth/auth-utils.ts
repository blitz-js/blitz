import { SecurePassword, AuthenticationError } from "blitz"
import db from "db"
import { gql } from "graphql-request"

export const authenticateUser = async (email: string, password: string) => {
  const { user } = await db.request(
    gql`
      query getUser($email: String!) {
        user: findUserByEmail(email: $email) {
          id: _id
          email
          name
          role
          hashedPassword
        }
      }
    `,
    { email: email.toLowerCase() }
  )

  if (!user || !user.hashedPassword) throw new AuthenticationError()

  const result = await SecurePassword.verify(user.hashedPassword, password)

  if (result === SecurePassword.VALID_NEEDS_REHASH) {
    // Upgrade hashed password with a more secure hash
    const improvedHash = await SecurePassword.hash(password)
    await db.request(
      gql`
        mutation UpdateUser($data: UserInput!) {
          updateUser(data: $data) {
            id: _id
          }
        }
      `,
      {
        data: {
          id: user.id,
          hashedPassword: improvedHash,
        },
      }
    )
  }

  const { hashedPassword, ...rest } = user
  return rest
}
