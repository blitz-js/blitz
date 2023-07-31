import prisma from "./index"
import {SecurePassword} from "@blitzjs/auth/secure-password"

const seed = async () => {
  const hashedPassword = await SecurePassword.hash("abcd1234")
  await prisma.user.upsert({
    where: {
      email: "test@test.com",
    },
    update: {
      hashedPassword,
      role: "user",
    },
    create: {
      email: "test@test.com",
      hashedPassword,
      role: "user",
    },
  })
  process.exit(0)
}

seed().catch

export default seed
