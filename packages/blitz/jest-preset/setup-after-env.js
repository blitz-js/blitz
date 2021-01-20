require("@testing-library/jest-dom")

afterAll(async () => {
  try {
    await global._blitz_prismaClient.$disconnect()
  } catch (error) {
    // ignore error
  }
})
