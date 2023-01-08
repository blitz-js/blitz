import prisma from "./index"
import {SecurePassword} from "@blitzjs/auth"

const seed = async () => {
  const hashedPassword = await SecurePassword.hash("abcd1234")
  const admin_exists = await prisma.user.findFirst({
    where: {
      role: "admin",
    },
  })
  if (!admin_exists) {
    await prisma.user.create({
      data: {
        email: "test@test.com",
        hashedPassword,
        role: "admin",
      },
    })
  }
  process.exit(0)
}

seed()

export default seed
