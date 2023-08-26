import db from "./index"
import { SecurePassword } from "@blitzjs/auth/secure-password"

const seed = async () => {
  const password = "e2euserpassword"
  const hashedPassword = await SecurePassword.hash(password.trim())
  await db.user.create({ data: { email: "e2e@user.de", hashedPassword } })
}

export default seed
