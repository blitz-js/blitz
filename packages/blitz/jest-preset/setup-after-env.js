require("@testing-library/jest-dom")

afterAll(async () => {
  try {
    // eslint-disable-next-line no-undef
    await globalThis._blitz_prismaClient.$disconnect()
  } catch (error) {
    // ignore error
  }
})
