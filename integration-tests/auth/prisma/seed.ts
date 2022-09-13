import prisma from "./index"
import {SecurePassword} from "@blitzjs/auth"

const seed = async () => {
  await prisma.$reset()

  const hashedPassword = await SecurePassword.hash("abcd1234")

  try {
    await prisma.user.create({
      data: {
        email: "test@test.com",
        hashedPassword,
        role: "user",
      },
    })
  } catch (err) {
    console.log(err)
  }

  process.exit(0)
}

seed()

export default seed
